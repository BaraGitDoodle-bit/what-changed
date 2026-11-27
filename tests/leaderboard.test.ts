import { describe, expect, it } from 'vitest';
import { beatPercent, buildLeaderboardView, median, rankFor, sortLeaderboard } from '../src/shared/leaderboard';
import type { LeaderEntry } from '../src/shared/types';

const entries: LeaderEntry[] = [
  { username: 'zoe', timeMs: 50_000, pings: 0, misses: 0 },
  { username: 'amy', timeMs: 40_000, pings: 1, misses: 1 },
  { username: 'bob', timeMs: 40_000, pings: 0, misses: 2 },
  { username: 'cal', timeMs: 40_000, pings: 0, misses: 0 },
  { username: 'dee', timeMs: 60_000, pings: 0, misses: 0 },
];

describe('leaderboard ordering', () => {
  it('sorts by time, then fewer pings, then fewer misses, then name', () => {
    const rows = sortLeaderboard(entries);
    expect(rows.map((r) => r.username)).toEqual(['cal', 'bob', 'amy', 'zoe', 'dee']);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4, 5]);
  });

  it('breaks a full tie by username', () => {
    const rows = sortLeaderboard([
      { username: 'bbb', timeMs: 10_000, pings: 0, misses: 0 },
      { username: 'aaa', timeMs: 10_000, pings: 0, misses: 0 },
    ]);
    expect(rows.map((r) => r.username)).toEqual(['aaa', 'bbb']);
  });

  it('reports rank and percentile for a player', () => {
    const rows = sortLeaderboard(entries);
    expect(rankFor(rows, 'cal')).toBe(1);
    expect(rankFor(rows, 'dee')).toBe(5);
    expect(rankFor(rows, 'nobody')).toBeNull();
    expect(beatPercent(rows, 'cal')).toBe(80);
    expect(beatPercent(rows, 'dee')).toBe(0);
  });

  it('computes the median of odd and even samples', () => {
    expect(median([30, 10, 20])).toBe(20);
    expect(median([10, 20, 30, 40])).toBe(25);
    expect(median([])).toBeNull();
  });

  it('builds a top-10 view with subreddit stats', () => {
    const rows = sortLeaderboard(entries);
    const view = buildLeaderboardView(rows, 'bob', 41);
    expect(view.rows).toHaveLength(5);
    expect(view.solvers).toBe(5);
    expect(view.yourRank).toBe(2);
    expect(view.beatPct).toBe(60);
    expect(view.medianMs).toBe(40_000);
    expect(view.perfectPct).toBe(41);
  });
});
