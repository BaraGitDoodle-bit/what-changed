import { keys } from './keys';
import { isLockAcquired, type Store } from './store';
import { hotZoneFor, nextUnfound, resolveTap, tapToScene } from './taps';
import {
  buildLeaderboardView,
  median,
  sortLeaderboard,
} from '../../shared/leaderboard';
import { applySolve, emptyStreak, nextTierFor, tierFor } from '../../shared/streak';
import { buildResultView } from '../../shared/share';
import type {
  Diff,
  InitResponse,
  LeaderRow,
  PingResponse,
  PlayMode,
  ResultView,
  RevealDiff,
  RunState,
  Scene,
  StreakRecord,
  TapResponse,
} from '../../shared/types';

export const ANTI_SPAM_MS = 250;
export const MISS_PENALTY_MS = 2_000;
export const PING_PENALTY_MS = 5_000;
export const MAX_PINGS = 3;
const RUN_TTL_SECONDS = 2 * 24 * 60 * 60;

export function penaltiesMs(run: Pick<RunState, 'misses' | 'pings'>): number {
  return run.misses * MISS_PENALTY_MS + run.pings * PING_PENALTY_MS;
}

export function emptyRun(): RunState {
  return {
    startedAt: 0,
    lastFindAt: 0,
    found: [],
    splits: [],
    pinged: [],
    pings: 0,
    misses: 0,
    doneAt: 0,
    timeMs: 0,
    practice: false,
  };
}

function parseJsonArray(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function parseNumberArray(value: string | undefined): number[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === 'number') : [];
  } catch {
    return [];
  }
}

function num(value: string | undefined, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function loadRun(store: Store, date: string, username: string): Promise<RunState> {
  const hash = await store.hGetAll(keys.run(date, username));
  if (Object.keys(hash).length === 0) return emptyRun();
  return {
    startedAt: num(hash.startedAt),
    lastFindAt: num(hash.lastFindAt),
    found: parseJsonArray(hash.found),
    splits: parseNumberArray(hash.splits),
    pinged: parseJsonArray(hash.pinged),
    pings: num(hash.pings),
    misses: num(hash.misses),
    doneAt: num(hash.doneAt),
    timeMs: num(hash.timeMs),
    practice: hash.practice === '1',
  };
}

export async function saveRun(
  store: Store,
  date: string,
  username: string,
  run: RunState,
): Promise<void> {
  await store.hSet(keys.run(date, username), {
    startedAt: String(run.startedAt),
    lastFindAt: String(run.lastFindAt),
    found: JSON.stringify(run.found),
    splits: JSON.stringify(run.splits),
    pinged: JSON.stringify(run.pinged),
    pings: String(run.pings),
    misses: String(run.misses),
    doneAt: String(run.doneAt),
    timeMs: String(run.timeMs),
    practice: run.practice ? '1' : '0',
  });
  await store.expire(keys.run(date, username), RUN_TTL_SECONDS);
}

/** Clock starts on the first tap, not on page load. */
export async function startRun(
  store: Store,
  date: string,
  username: string,
  now: number,
): Promise<RunState> {
  const run = await loadRun(store, date, username);
  if (run.startedAt > 0 || run.doneAt > 0) return run;

  run.startedAt = now;
  await saveRun(store, date, username, run);

  await countStart(store, date, username);
  return run;
}

/** Counts unique players who started (not just solved) — powers "% found all". */
async function countStart(store: Store, date: string, username: string): Promise<void> {
  const firstEver = await store.set(keys.started(date, username), '1', {
    nx: true,
    ttlSeconds: RUN_TTL_SECONDS,
  });
  if (isLockAcquired(firstEver)) {
    await store.hIncrBy(keys.stats(date), 'started', 1);
  }
}

export async function recordPractice(
  store: Store,
  date: string,
  username: string,
  alreadyScored: boolean,
): Promise<RunState> {
  const run = emptyRun();
  run.practice = alreadyScored;
  if (alreadyScored) {
    await saveRun(store, date, username, run);
  } else {
    await store.del(keys.run(date, username));
  }
  return run;
}

export async function readStreak(store: Store, username: string): Promise<StreakRecord> {
  const hash = await store.hGetAll(keys.user(username));
  if (Object.keys(hash).length === 0) return emptyStreak();
  return {
    streak: num(hash.streak),
    lastPlayed: hash.lastPlayed && hash.lastPlayed.length > 0 ? hash.lastPlayed : null,
    bestMs: num(hash.bestMs),
    plays: num(hash.plays),
    snoozes: num(hash.snoozes),
  };
}

async function writeStreak(
  store: Store,
  username: string,
  record: StreakRecord,
): Promise<void> {
  await store.hSet(keys.user(username), {
    streak: String(record.streak),
    lastPlayed: record.lastPlayed ?? '',
    bestMs: String(record.bestMs),
    plays: String(record.plays),
    snoozes: String(record.snoozes),
  });
}

function toReveal(diff: Diff): RevealDiff {
  return {
    id: diff.id,
    op: diff.op,
    cx: diff.cx,
    cy: diff.cy,
    bbox: diff.bbox,
    label: diff.label,
  };
}

export async function readLeaderboard(store: Store, date: string): Promise<LeaderRow[]> {
  const members = await store.zRange(keys.leaderboard(date), 0, -1);
  if (members.length === 0) return [];
  const aux = await store.hGetAll(keys.leaderboardAux(date));
  const entries = members.map((entry) => {
    let pings = 0;
    let misses = 0;
    const raw = aux[entry.member];
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { pings?: number; misses?: number };
        pings = typeof parsed.pings === 'number' ? parsed.pings : 0;
        misses = typeof parsed.misses === 'number' ? parsed.misses : 0;
      } catch {
        // A corrupt aux row must not break the board; treat as zero.
      }
    }
    return { username: entry.member, timeMs: Math.round(entry.score), pings, misses };
  });
  return sortLeaderboard(entries);
}

async function statsView(
  store: Store,
  date: string,
): Promise<{ solvers: number; started: number; perfectPct: number | null }> {
  const stats = await store.hGetAll(keys.stats(date));
  const solvers = num(stats.solvers);
  const started = num(stats.started);
  const perfectPct = started > 0 ? Math.round((solvers / started) * 100) : null;
  return { solvers, started, perfectPct };
}

export async function buildResult(
  store: Store,
  scene: Scene,
  date: string,
  username: string,
  run: RunState,
  scorable: boolean,
  streakRecord: StreakRecord,
): Promise<ResultView> {
  const rows = await readLeaderboard(store, date);
  const me = rows.find((row) => row.username === username) ?? null;
  const { solvers, perfectPct } = await statsView(store, date);
  const tier = tierFor(streakRecord.streak);
  const allowed = rows.length;

  return buildResultView({
    timeMs: run.timeMs,
    splits: run.splits.slice(0, scene.diffs.length),
    pings: run.pings,
    misses: run.misses,
    total: scene.diffs.length,
    diffs: scene.diffs.map(toReveal),
    rank: me?.rank ?? null,
    solvers: Math.max(solvers, allowed),
    beatPct:
      me && allowed > 0 ? Math.round(((allowed - me.rank) / allowed) * 100) : null,
    parMs: scene.parMs,
    medianMs: median(rows.map((row) => row.timeMs)),
    perfectPct,
    leaderboard: rows.slice(0, 10),
    streak: streakRecord.streak,
    scorable,
    dayNumber: scene.dayNumber,
    themeName: scene.themeName,
    flair: tier?.name ?? null,
  });
}

function tapResponse(
  run: RunState,
  scene: Scene,
  extra: Partial<TapResponse> = {},
): TapResponse {
  return {
    ok: true,
    hit: false,
    found: run.found.length,
    total: scene.diffs.length,
    missCount: run.misses,
    pings: run.pings,
    elapsedMs: penaltiesMs(run),
    done: false,
    ...extra,
  };
}

export interface TapInput {
  store: Store;
  scene: Scene;
  date: string;
  username: string;
  now: number;
  nx: number;
  ny: number;
}

export async function handleTap(input: TapInput): Promise<TapResponse> {
  const { store, scene, date, username, now, nx, ny } = input;
  const run = await loadRun(store, date, username);
  const streakRecord = await readStreak(store, username);

  if (run.doneAt > 0) {
    return {
      ...tapResponse(run, scene, { ok: false, done: true, reason: 'already-done' }),
      result: await buildResult(store, scene, date, username, run, !run.practice, streakRecord),
    };
  }

  if (run.startedAt === 0) {
    run.startedAt = now;
    await countStart(store, date, username);
  }

  if (run.lastFindAt > 0 && now - run.lastFindAt < ANTI_SPAM_MS) {
    return tapResponse(run, scene, { ok: false, reason: 'too-fast' });
  }

  const point = tapToScene(nx, ny);
  const hit = resolveTap(scene, run.found, point.x, point.y);

  if (!hit) {
    run.misses += 1;
    await saveRun(store, date, username, run);
    return tapResponse(run, scene, {
      ok: true,
      hit: false,
      reason: 'miss',
      elapsedMs: now - run.startedAt + penaltiesMs(run),
    });
  }

  const elapsed = now - run.startedAt;
  run.found.push(hit.id);
  run.splits.push(elapsed + penaltiesMs(run));
  run.lastFindAt = now;

  const complete = run.found.length >= scene.diffs.length;
  if (!complete) {
    await saveRun(store, date, username, run);
    return tapResponse(run, scene, {
      ok: true,
      hit: true,
      bbox: hit.bbox,
      diffId: hit.id,
      found: run.found.length,
      elapsedMs: elapsed + penaltiesMs(run),
    });
  }

  // ---- finalize ----------------------------------------------------------
  run.doneAt = now;
  run.timeMs = Math.max(0, Math.round(elapsed + penaltiesMs(run)));

  let scorable = false;
  if (!run.practice) {
    const claimed = await store.set(keys.done(date, username), '1', {
      nx: true,
      ttlSeconds: RUN_TTL_SECONDS,
    });
    scorable = isLockAcquired(claimed);
  }

  let finalStreak = streakRecord;
  if (scorable) {
    await store.zAdd(keys.leaderboard(date), username, run.timeMs);
    await store.hSet(keys.leaderboardAux(date), {
      [username]: JSON.stringify({ pings: run.pings, misses: run.misses }),
    });
    await store.hIncrBy(keys.stats(date), 'solvers', 1);
    await store.hIncrBy(keys.stats(date), 'sumMs', run.timeMs);
    await store.hIncrBy(keys.stats(date), 'perfectCount', 1);
    const existing = await store.hGetAll(keys.stats(date));
    const previousFastest = Number(existing.fastest);
    if (!Number.isFinite(previousFastest) || previousFastest <= 0 || run.timeMs < previousFastest) {
      await store.hSet(keys.stats(date), {
        fastest: String(run.timeMs),
        fastestUser: username,
      });
    }

    const outcome = applySolve(streakRecord, date, run.timeMs);
    finalStreak = outcome.record;
    await writeStreak(store, username, finalStreak);
  }

  await saveRun(store, date, username, run);
  const result = await buildResult(store, scene, date, username, run, scorable, finalStreak);

  return {
    ...tapResponse(run, scene, {
      ok: true,
      hit: true,
      bbox: hit.bbox,
      diffId: hit.id,
      found: run.found.length,
      done: true,
      elapsedMs: run.timeMs,
      result,
    }),
    result,
  };
}

export interface PingInput {
  store: Store;
  scene: Scene;
  date: string;
  username: string;
  now: number;
}

export async function handlePing(input: PingInput): Promise<PingResponse> {
  const { store, scene, date, username, now } = input;
  const run = await loadRun(store, date, username);

  if (run.doneAt > 0) {
    return { ok: false, pings: run.pings, pingsLeft: 0, elapsedMs: run.timeMs, reason: 'already-done' };
  }
  if (run.pings >= MAX_PINGS) {
    return {
      ok: false,
      pings: run.pings,
      pingsLeft: 0,
      elapsedMs: run.startedAt > 0 ? now - run.startedAt + penaltiesMs(run) : 0,
      reason: 'no-pings',
    };
  }
  if (run.startedAt === 0) {
    run.startedAt = now;
    await countStart(store, date, username);
  }

  const target =
    scene.diffs.find((diff) => !run.found.includes(diff.id) && !run.pinged.includes(diff.id)) ??
    nextUnfound(scene, run.found);
  if (!target) {
    return { ok: false, pings: run.pings, pingsLeft: 0, elapsedMs: 0, reason: 'already-done' };
  }

  run.pings += 1;
  if (!run.pinged.includes(target.id)) run.pinged.push(target.id);
  await saveRun(store, date, username, run);

  const zone = hotZoneFor(target, run.pings * 37 + scene.diffs.length);
  return {
    ok: true,
    zone,
    pings: run.pings,
    pingsLeft: MAX_PINGS - run.pings,
    elapsedMs: now - run.startedAt + penaltiesMs(run),
  };
}

export interface InitInput {
  store: Store;
  scene: Scene;
  date: string;
  username: string;
  postId: string | null;
}

export async function buildInitState(input: InitInput): Promise<InitResponse> {
  const { store, scene, date, username, postId } = input;
  const run = await loadRun(store, date, username);
  const streakRecord = await readStreak(store, username);
  const rows = await readLeaderboard(store, date);
  const { solvers, perfectPct } = await statsView(store, date);
  const scored = (await store.exists(keys.done(date, username))) > 0;
  const hintUsed = (await store.exists(keys.hint(date, username))) > 0;

  let mode: PlayMode;
  if (scored && run.doneAt > 0) mode = 'done';
  else if (scored) mode = 'practice';
  else mode = 'scored';

  const result =
    scored && run.doneAt > 0
      ? await buildResult(store, scene, date, username, run, !run.practice, streakRecord)
      : null;

  const tier = tierFor(streakRecord.streak);

  return {
    ok: true,
    date,
    dayNumber: scene.dayNumber,
    theme: scene.theme,
    themeName: scene.themeName,
    scene: {
      v: 1,
      date: scene.date,
      dayNumber: scene.dayNumber,
      theme: scene.theme,
      themeName: scene.themeName,
      width: scene.width,
      height: scene.height,
      before: scene.before,
      after: scene.after,
      total: scene.diffs.length,
      parMs: scene.parMs,
    },
    total: scene.diffs.length,
    parMs: scene.parMs,
    mode,
    result,
    streak: {
      streak: streakRecord.streak,
      lastPlayed: streakRecord.lastPlayed,
      bestMs: streakRecord.bestMs > 0 ? streakRecord.bestMs : null,
      plays: streakRecord.plays,
      snoozes: streakRecord.snoozes,
      tierName: tier?.name ?? null,
      nextTier: nextTierFor(streakRecord.streak),
    },
    leaderboard: buildLeaderboardView(rows, username, perfectPct),
    startedAt: run.startedAt > 0 ? run.startedAt : null,
    found: run.found,
    foundDiffs: scene.diffs.filter((diff) => run.found.includes(diff.id)).map(toReveal),
    splits: run.splits,
    pings: run.pings,
    misses: run.misses,
    postId,
    hintUsed,
    flair: tier?.name ?? null,
    snoovatar: null,
  };
}
