import { formatClock } from '../../shared/share';

interface Props {
  elapsed: number;
  found: number;
  total: number;
  misses: number;
  pings: number;
  disabled: boolean;
  muted: boolean;
  expanded: boolean;
  onPing: () => void;
  onToggleMute: () => void;
  onToggleExpand: () => void;
}

export function Hud({
  elapsed,
  found,
  total,
  misses,
  pings,
  disabled,
  muted,
  expanded,
  onPing,
  onToggleMute,
  onToggleExpand,
}: Props) {
  const pingsLeft = Math.max(0, 3 - pings);

  return (
    <div className="mb-2 flex items-stretch gap-2">
      <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-[#29414f] bg-[#101d26] px-3 py-1.5">
        <span className="font-mono text-2xl leading-none font-bold tabular-nums text-[#F4EFE4]">
          {formatClock(elapsed)}
        </span>
        <span className="mt-1 text-[10px] font-semibold tracking-wide text-slate-400">
          {found}/{total} found
          {misses > 0 ? <span className="text-[#FF9F9F]"> · {misses} miss{misses === 1 ? '' : 'es'}</span> : null}
        </span>
      </div>

      <button
        type="button"
        onClick={onPing}
        disabled={disabled || pingsLeft === 0}
        aria-label={`Ping: light a hot zone. ${pingsLeft} left, costs 5 seconds.`}
        className="flex w-[74px] flex-col items-center justify-center rounded-xl border border-[#3E5A6B] bg-[#17303d] text-[#7FD1F2] transition active:translate-y-0.5 disabled:opacity-40"
      >
        <span className="text-xl leading-none">◎</span>
        <span className="mt-0.5 text-[10px] font-bold">PING {pingsLeft}</span>
        <span className="text-[9px] text-slate-400">+5s</span>
      </button>

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          className="flex h-1/2 w-9 items-center justify-center rounded-lg border border-[#29414f] bg-[#101d26] text-sm text-slate-300"
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={expanded ? 'Exit full screen' : 'Expand to full screen'}
          className="flex h-1/2 w-9 items-center justify-center rounded-lg border border-[#29414f] bg-[#101d26] text-sm text-slate-300"
        >
          {expanded ? '✕' : '⤢'}
        </button>
      </div>
    </div>
  );
}
