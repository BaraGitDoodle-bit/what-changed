import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { PingZone, PublicScene } from '../../shared/types';
import { SceneSvg } from './SceneSvg';
import type { SceneRing } from './types';

interface Props {
  scene: PublicScene;
  panel: 'before' | 'after';
  label: string;
  rings: SceneRing[];
  pingZone?: PingZone | null;
  disabled?: boolean;
  shakeKey?: number;
  onTap?: (nx: number, ny: number) => void;
}

const LOUPE_SIZE = 116;
const LOUPE_ZOOM = 2.4;
const HOLD_MS = 300;

interface LoupeState {
  pageX: number;
  pageY: number;
  rect: { left: number; top: number; width: number; height: number };
  localX: number;
  localY: number;
}

export function ScenePanel({
  scene,
  panel,
  label,
  rings,
  pingZone,
  disabled,
  shakeKey = 0,
  onTap,
}: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const [loupe, setLoupe] = useState<LoupeState | null>(null);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (shakeKey === 0) return;
    setShaking(true);
    const id = window.setTimeout(() => setShaking(false), 260);
    return () => window.clearTimeout(id);
  }, [shakeKey]);

  useEffect(
    () => () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
    },
    [],
  );

  function clearHold() {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || !onTap) return;
    const surface = surfaceRef.current;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    origin.current = { x: event.clientX, y: event.clientY };
    moved.current = false;

    clearHold();
    holdTimer.current = window.setTimeout(() => {
      setLoupe({
        pageX: event.clientX,
        pageY: event.clientY,
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        localX: event.clientX - rect.left,
        localY: event.clientY - rect.top,
      });
    }, HOLD_MS);
  }

  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!origin.current) return;
    const dx = event.clientX - origin.current.x;
    const dy = event.clientY - origin.current.y;
    if (Math.hypot(dx, dy) > 10) {
      moved.current = true;
      clearHold();
      if (loupe) setLoupe(null);
    }
  }

  function pointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || !onTap) return;
    clearHold();
    if (loupe) {
      // A hold is a look through the loupe, never a claim.
      setLoupe(null);
      origin.current = null;
      return;
    }
    if (!origin.current || moved.current) {
      origin.current = null;
      return;
    }
    const surface = surfaceRef.current;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    origin.current = null;
    if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
    onTap(nx, ny);
  }

  function pointerCancel() {
    clearHold();
    setLoupe(null);
    origin.current = null;
  }

  const loupeInner =
    loupe && surfaceRef.current
      ? {
          width: loupe.rect.width,
          height: loupe.rect.height,
          transform: `translate(${LOUPE_SIZE / 2 - loupe.localX * LOUPE_ZOOM}px, ${
            LOUPE_SIZE / 2 - loupe.localY * LOUPE_ZOOM
          }px) scale(${LOUPE_ZOOM})`,
        }
      : null;

  return (
    <section className="w-full">
      <div className="mb-1 flex items-center justify-between px-0.5">
        <span className="text-[10px] font-bold tracking-[0.22em] text-slate-400">{label}</span>
        <span className="text-[10px] text-slate-500">
          {disabled ? 'tap to close' : 'hold to magnify'}
        </span>
      </div>
      <div
        ref={surfaceRef}
        className={`wc-panel relative overflow-hidden rounded-xl border-2 border-[#29414f] bg-[#0f1c25] shadow-[0_6px_0_0_#081218] ${
          shaking ? 'wc-shake' : ''
        }`}
        style={{ aspectRatio: `${scene.width} / ${scene.height}`, touchAction: 'none' }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerCancel}
        onPointerLeave={pointerCancel}
        onContextMenu={(event) => event.preventDefault()}
      >
        <SceneSvg scene={scene} panel={panel} rings={rings} pingZone={pingZone} />
      </div>

      {loupe && loupeInner && (
        <div
          className="pointer-events-none fixed z-50 overflow-hidden rounded-full border-4 border-[#FFC93C] shadow-xl"
          style={{
            left: loupe.pageX - LOUPE_SIZE / 2,
            top: loupe.pageY - LOUPE_SIZE / 2,
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            background: '#0f1c25',
          }}
        >
          <div className="absolute origin-top-left" style={loupeInner}>
            <SceneSvg scene={scene} panel={panel} rings={rings} pingZone={pingZone} />
          </div>
        </div>
      )}
    </section>
  );
}
