import type { LeaderRow, ResultView, RevealDiff, StreakRecord } from './types';
import type { Theme } from './themes';

/** 41234 -> "0:41.2" */
export function formatClock(ms: number): string {
  const safe = Math.max(0, Math.round(ms));
  const minutes = Math.floor(safe / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  const tenths = Math.floor((safe % 1000) / 100);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

/** 41234 -> "41.2" (share splits are raw seconds). */
export function formatSplit(ms: number): string {
  return (Math.max(0, ms) / 1000).toFixed(1);
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export function buildShareBlock(input: {
  dayNumber: number;
  themeName: string;
  found: number;
  total: number;
  timeMs: number;
  pings: number;
  misses: number;
  streak: number;
  splits: number[];
}): string {
  const lines = [
    `WHAT CHANGED #${input.dayNumber} — ${input.themeName}`,
    `🔍 ${input.found}/${input.total} · ⏱ ${formatClock(input.timeMs)} · 🎯 ${input.pings} ${plural(
      input.pings,
      'ping',
      'pings',
    )} · ❌ ${input.misses} ${plural(input.misses, 'miss', 'misses')} · 🔥 ${input.streak}`,
  ];
  if (input.splits.length > 0) {
    lines.push(`splits ${input.splits.map(formatSplit).join(' / ')}`);
  }
  return lines.join('\n');
}

export function buildResultView(input: {
  timeMs: number;
  splits: number[];
  pings: number;
  misses: number;
  total: number;
  diffs: RevealDiff[];
  rank: number | null;
  solvers: number;
  beatPct: number | null;
  parMs: number;
  medianMs: number | null;
  perfectPct: number | null;
  leaderboard: LeaderRow[];
  streak: number;
  scorable: boolean;
  dayNumber: number;
  themeName: string;
  flair: string | null;
}): ResultView {
  return {
    timeMs: input.timeMs,
    splits: input.splits,
    pings: input.pings,
    misses: input.misses,
    found: input.diffs.length,
    total: input.total,
    scorable: input.scorable,
    rank: input.rank,
    solvers: input.solvers,
    beatPct: input.beatPct,
    parMs: input.parMs,
    medianMs: input.medianMs,
    perfectPct: input.perfectPct,
    leaderboard: input.leaderboard,
    diffs: input.diffs,
    share: buildShareBlock({
      dayNumber: input.dayNumber,
      themeName: input.themeName,
      found: input.diffs.length,
      total: input.total,
      timeMs: input.timeMs,
      pings: input.pings,
      misses: input.misses,
      streak: input.streak,
      splits: input.splits,
    }),
    streak: input.streak,
    flair: input.flair,
  };
}

/** Praise line from par: the result card's one-liner. */
export function ratingLine(timeMs: number, parMs: number): string {
  const ratio = timeMs / Math.max(1, parMs);
  if (ratio <= 0.55) return 'Photographic memory. Show-off.';
  if (ratio <= 0.8) return 'That was quick. The changes barely had time to hide.';
  if (ratio <= 1.05) return 'Right on par. Solid eye.';
  if (ratio <= 1.4) return 'Found them all. The clock was unkind.';
  return 'All found. Next time, spend a ping earlier.';
}

export interface QuadrantHintInput {
  cx: number;
  cy: number;
  theme: Theme;
}

export function quadrantHint({ cx, cy, theme }: QuadrantHintInput): string {
  const north = cy < 110;
  const west = cx < 160;
  const place = north
    ? west
      ? theme.places.nw
      : theme.places.ne
    : west
      ? theme.places.sw
      : theme.places.se;
  return `>!${place}.!<`;
}

export function streakLine(record: StreakRecord | null): string {
  const streak = record?.streak ?? 0;
  if (streak <= 0) return 'No streak yet — today is day one.';
  return `🔥 ${streak} — don't break it`;
}
