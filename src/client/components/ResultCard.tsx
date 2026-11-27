import { formatClock, formatSplit, ratingLine } from '../../shared/share';
import type { PlayMode, ResultView } from '../../shared/types';

interface Props {
  result: ResultView;
  mode: PlayMode;
  streak: number;
  snoozes: number;
  tierName: string | null;
  snoovatar: string | null;
  onCopy: () => void;
  onComment: () => void;
  onPractice: () => void;
  onClose: () => void;
}

export function ResultCard({
  result,
  mode,
  streak,
  snoozes,
  tierName,
  snoovatar,
  onCopy,
  onComment,
  onPractice,
  onClose,
}: Props) {
  const practice = !result.scorable;
  const perfect = result.total > 0 && result.found === result.total;

  return (
    <div className="wc-rise fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[560px]">
      <div className="max-h-[84vh] overflow-y-auto rounded-t-2xl border-x-2 border-t-2 border-[#3E5A6B] bg-[#0F1C25] px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#7FD1F2]">
              {practice ? 'PRACTICE RUN' : perfect ? 'ALL FOUND' : 'RUN OVER'}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-black tabular-nums text-[#FFC93C]">
                {formatClock(result.timeMs)}
              </span>
              <span className="text-[11px] text-slate-400">
                {result.pings} ping{result.pings === 1 ? '' : 's'} · {result.misses} miss
                {result.misses === 1 ? '' : 'es'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {snoovatar && (
              <div className="flex flex-col items-center">
                <img
                  src={snoovatar}
                  alt="Your snoovatar"
                  className="h-9 w-9 rounded-full border border-[#29414f] bg-[#0B141B] object-contain"
                />
                <span className="mt-0.5 text-[8px] text-slate-500">you were there</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close result card and look at the board"
              className="rounded-lg border border-[#29414f] px-2 py-1 text-xs text-slate-300"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="mb-2 text-[12px] text-slate-300">{ratingLine(result.timeMs, result.parMs)}</p>

        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-[#14232E] px-1 py-2">
            <p className="text-[9px] font-bold tracking-wider text-slate-400">RANK</p>
            <p className="text-sm font-bold text-[#F4EFE4]">
              {practice || result.rank === null ? '—' : `#${result.rank}`}
            </p>
            <p className="text-[9px] text-slate-500">
              {practice ? 'unranked' : `of ${result.solvers}`}
            </p>
          </div>
          <div className="rounded-lg bg-[#14232E] px-1 py-2">
            <p className="text-[9px] font-bold tracking-wider text-slate-400">BEAT</p>
            <p className="text-sm font-bold text-[#F4EFE4]">
              {practice || result.beatPct === null ? '—' : `${result.beatPct}%`}
            </p>
            <p className="text-[9px] text-slate-500">of the sub</p>
          </div>
          <div className="rounded-lg bg-[#14232E] px-1 py-2">
            <p className="text-[9px] font-bold tracking-wider text-slate-400">STREAK</p>
            <p className="text-sm font-bold text-[#F4EFE4]">🔥 {streak}</p>
            <p className="text-[9px] text-slate-500">
              {snoozes > 0 ? `${snoozes} snooze` : tierName ?? 'keep going'}
            </p>
          </div>
        </div>

        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400">SPLITS</p>
          <div className="flex flex-wrap gap-1">
            {result.splits.map((split, index) => (
              <span
                key={`${split}-${index}`}
                className="rounded-md bg-[#17303D] px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-[#7FD1F2]"
              >
                {index + 1}. {formatSplit(split)}s
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3 rounded-lg border border-[#29414f] bg-[#101d26] p-2">
          <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400">
            WHAT WAS DIFFERENT
          </p>
          <ul className="space-y-0.5">
            {result.diffs.map((diff, index) => (
              <li key={diff.id} className="flex gap-1.5 text-[11px] text-slate-300">
                <span className="w-4 text-[#FFC93C]">{index + 1}.</span>
                <span>{diff.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3 rounded-lg border border-[#29414f] bg-[#101d26] p-2">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-wider text-slate-400">TODAY IN THIS SUB</p>
            <p className="text-[10px] text-slate-400">
              {result.perfectPct === null ? '—' : `${result.perfectPct}% found all`} ·{' '}
              {result.medianMs === null ? '—' : `median ${formatClock(result.medianMs)}`}
            </p>
          </div>
          <ol className="space-y-0.5">
            {result.leaderboard.slice(0, 5).map((row) => (
              <li
                key={row.username}
                className={`flex items-center justify-between rounded px-1 text-[11px] ${
                  result.rank === row.rank
                    ? 'bg-[#17303D] font-bold text-[#FFC93C]'
                    : 'text-slate-300'
                }`}
              >
                <span className="truncate">
                  {row.rank}. u/{row.username}
                </span>
                <span className="font-mono tabular-nums">{formatClock(row.timeMs)}</span>
              </li>
            ))}
            {result.leaderboard.length === 0 && (
              <li className="px-1 text-[11px] text-slate-500">You are first. Enjoy it.</li>
            )}
          </ol>
        </div>

        <div className="mb-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg bg-[#FFC93C] px-3 py-2 text-[13px] font-black text-[#20312B] active:translate-y-0.5"
          >
            Copy result
          </button>
          <button
            type="button"
            onClick={onComment}
            className="rounded-lg border border-[#3E5A6B] bg-[#17303D] px-3 py-2 text-[13px] font-bold text-[#F4EFE4] active:translate-y-0.5"
          >
            Comment it
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onPractice}
            className="text-[11px] font-semibold text-[#7FD1F2] underline decoration-dotted"
          >
            {mode === 'practice' ? 'Restart practice' : 'Play again (unranked practice)'}
          </button>
          <p className="text-right text-[10px] text-slate-500">
            Helping someone? Wrap it in <span className="text-slate-300">&gt;!spoiler!&lt;</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
