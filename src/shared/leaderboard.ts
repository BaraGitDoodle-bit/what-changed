import type { LeaderEntry, LeaderRow, LeaderboardView } from './types';

/** Time ascending, then fewer pings, then fewer misses, then username. */
export function compareEntries(a: LeaderEntry, b: LeaderEntry): number {
  if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
  if (a.pings !== b.pings) return a.pings - b.pings;
  if (a.misses !== b.misses) return a.misses - b.misses;
  return a.username.localeCompare(b.username);
}

export function sortLeaderboard(entries: LeaderEntry[]): LeaderRow[] {
  return [...entries]
    .sort(compareEntries)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function rankFor(rows: LeaderRow[], username: string): number | null {
  return rows.find((row) => row.username === username)?.rank ?? null;
}

/** Percentage of solvers this player finished ahead of. */
export function beatPercent(rows: LeaderRow[], username: string): number | null {
  const index = rows.findIndex((row) => row.username === username);
  if (index < 0 || rows.length === 0) return null;
  const beaten = rows.length - (index + 1);
  return Math.round((beaten / rows.length) * 100);
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
    : sorted[mid]!;
}

export function buildLeaderboardView(
  rows: LeaderRow[],
  username: string | null,
  perfectPct: number | null,
  limit = 10,
): LeaderboardView {
  const times = rows.map((r) => r.timeMs);
  return {
    rows: rows.slice(0, limit),
    solvers: rows.length,
    yourRank: username ? rankFor(rows, username) : null,
    beatPct: username ? beatPercent(rows, username) : null,
    medianMs: median(times),
    perfectPct,
  };
}
