import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, api } from './api';
import { copyText } from './clipboard';
import { isMuted, playMiss, playPing, playTick, playWin, setMuted as persistMute } from './sound';
import type { SceneRing } from './components/types';
import type {
  InitResponse,
  PingZone,
  ResultView,
  TapResponse,
} from '../shared/types';

export type Phase = 'loading' | 'play' | 'login' | 'error';

const MISS_PENALTY_MS = 2_000;
const PING_PENALTY_MS = 5_000;

export function useGame() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [init, setInit] = useState<InitResponse | null>(null);
  const [result, setResult] = useState<ResultView | null>(null);
  const [rings, setRings] = useState<SceneRing[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [pings, setPings] = useState(0);
  const [misses, setMisses] = useState(0);
  const [zone, setZone] = useState<PingZone | null>(null);
  const [shake, setShake] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [muted, setMutedState] = useState(false);

  const baseRef = useRef(0);
  const stampRef = useRef(0);
  const startedRef = useRef(false);
  const zoneTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  const flash = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const setClock = useCallback((ms: number) => {
    baseRef.current = Math.max(0, ms);
    stampRef.current = performance.now();
    setElapsed(baseRef.current);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed(baseRef.current + (performance.now() - stampRef.current));
    }, 100);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(
    () => () => {
      if (zoneTimer.current) window.clearTimeout(zoneTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const load = useCallback(async () => {
    setPhase('loading');
    try {
      const data = await api.init();
      setInit(data);
      setPings(data.pings);
      setMisses(data.misses);
      setFound(data.found);
      setRings(data.foundDiffs.map((diff) => ({ id: diff.id, bbox: diff.bbox })));
      setMutedState(isMuted());

      if (data.startedAt) {
        startedRef.current = true;
        setClock(
          Date.now() - data.startedAt + data.misses * MISS_PENALTY_MS + data.pings * PING_PENALTY_MS,
        );
        setRunning(true);
      }

      if (data.mode === 'done' && data.result) {
        setResult(data.result);
        setRings(data.result.diffs.map((diff) => ({ id: diff.id, bbox: diff.bbox })));
        setFound(data.result.diffs.map((diff) => diff.id));
        setRunning(false);
      }
      setPhase('play');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.code === 'login-required')) {
        setPhase('login');
      } else {
        setPhase('error');
      }
    }
  }, [setClock]);

  useEffect(() => {
    void load();
  }, [load]);

  const ensureStarted = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setClock(0);
    setRunning(true);
    try {
      await api.start();
    } catch {
      // The tap below still starts the run server-side as a fallback.
    }
  }, [setClock]);

  const applyServerClock = useCallback(
    (response: TapResponse | { elapsedMs: number }) => {
      setClock(response.elapsedMs);
    },
    [setClock],
  );

  const finish = useCallback((next: ResultView) => {
    setResult(next);
    setRings(next.diffs.map((diff) => ({ id: diff.id, bbox: diff.bbox })));
    setFound(next.diffs.map((diff) => diff.id));
    setRunning(false);
    setZone(null);
    if (!isMuted()) playWin();
  }, []);

  const tap = useCallback(
    async (nx: number, ny: number) => {
      if (phase !== 'play' || result) return;
      try {
        await ensureStarted();
        const response = await api.tap(nx, ny);

        if (response.done && response.result) {
          applyServerClock(response);
          finish(response.result);
          return;
        }

        if (response.ok) {
          applyServerClock(response);
          setPings(response.pings);
          setMisses(response.missCount);

          if (response.hit && response.diffId && response.bbox) {
            const diffId = response.diffId;
            const bbox = response.bbox;
            setFound((prev) => (prev.includes(diffId) ? prev : [...prev, diffId]));
            setRings((prev) =>
              prev.some((ring) => ring.id === diffId) ? prev : [...prev, { id: diffId, bbox }],
            );
            if (!isMuted()) playTick();
          } else if (response.reason === 'miss') {
            setShake((value) => value + 1);
            if (!isMuted()) playMiss();
          }
        } else if (response.reason === 'already-done' && response.result) {
          finish(response.result);
        }
      } catch {
        flash('Connection hiccup — tap again.');
      }
    },
    [phase, result, ensureStarted, applyServerClock, finish, flash],
  );

  const ping = useCallback(async () => {
    if (phase !== 'play' || result) return;
    try {
      await ensureStarted();
      const response = await api.ping();
      if (response.ok && response.zone) {
        setZone(response.zone);
        setPings(response.pings);
        applyServerClock(response);
        if (!isMuted()) playPing();
        if (zoneTimer.current) window.clearTimeout(zoneTimer.current);
        zoneTimer.current = window.setTimeout(() => setZone(null), 5_200);
      } else if (response.reason === 'no-pings') {
        flash('All three pings are spent.');
      }
    } catch {
      flash('Ping failed — try again.');
    }
  }, [phase, result, ensureStarted, applyServerClock, flash]);

  const shareCopy = useCallback(async () => {
    if (!result) return;
    const ok = await copyText(result.share);
    flash(ok ? 'Copied. Paste it in the thread.' : 'Copy failed — long-press the text instead.');
  }, [result, flash]);

  const shareComment = useCallback(async () => {
    if (!result) return;
    try {
      const response = await api.share();
      flash(response.already ? 'You already shared today.' : 'Posted in the comments.');
    } catch {
      flash('Could not post the comment. Use Copy instead.');
    }
  }, [result, flash]);

  const practice = useCallback(async () => {
    try {
      await api.practice();
      setResult(null);
      setFound([]);
      setRings([]);
      setPings(0);
      setMisses(0);
      setZone(null);
      setClock(0);
      setRunning(false);
      startedRef.current = false;
      if (init) {
        setInit({ ...init, mode: 'practice', found: [], foundDiffs: [], splits: [], pings: 0, misses: 0, startedAt: null });
      }
      flash('Practice run — nothing here counts.');
    } catch {
      flash('Could not start a practice run.');
    }
  }, [init, setClock, flash]);

  const toggleMute = useCallback(() => {
    setMutedState((current) => {
      persistMute(!current);
      return !current;
    });
  }, []);

  return {
    phase,
    init,
    result,
    rings,
    found,
    elapsed,
    running,
    pings,
    misses,
    zone,
    shake,
    toast,
    muted,
    tap,
    ping,
    shareCopy,
    shareComment,
    practice,
    toggleMute,
    reload: load,
  };
}
