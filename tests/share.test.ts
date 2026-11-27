import { describe, expect, it } from 'vitest';
import { buildShareBlock, formatClock, formatSplit, quadrantHint, ratingLine } from '../src/shared/share';
import { THEMES } from '../src/shared/themes';

describe('share + result formatting', () => {
  it('formats clocks and splits', () => {
    expect(formatClock(41_200)).toBe('0:41.2');
    expect(formatClock(65_400)).toBe('1:05.4');
    expect(formatClock(600_000)).toBe('10:00.0');
    expect(formatSplit(41_234)).toBe('41.2');
  });

  it('builds the timed-run share block exactly', () => {
    const block = buildShareBlock({
      dayNumber: 42,
      themeName: 'Park Afternoon',
      found: 5,
      total: 5,
      timeMs: 41_200,
      pings: 1,
      misses: 2,
      streak: 6,
      splits: [900, 2100, 8700, 12_400, 16_900],
    });

    expect(block).toBe(
      [
        'WHAT CHANGED #42 — Park Afternoon',
        '🔍 5/5 · ⏱ 0:41.2 · 🎯 1 ping · ❌ 2 misses · 🔥 6',
        'splits 0.9 / 2.1 / 8.7 / 12.4 / 16.9',
      ].join('\n'),
    );
  });

  it('never leaks a difference position into the share block', () => {
    const block = buildShareBlock({
      dayNumber: 1,
      themeName: 'Beach Day',
      found: 7,
      total: 7,
      timeMs: 80_000,
      pings: 0,
      misses: 0,
      streak: 1,
      splits: [1000],
    });
    expect(block).not.toMatch(/\d{2,3}\s*,\s*\d{2,3}/);
  });

  it('gives a par-based rating line', () => {
    expect(ratingLine(20_000, 60_000)).toContain('Show-off');
    expect(ratingLine(60_000, 60_000)).toContain('Solid eye');
  });

  it('maps a position to a spoiler-wrapped quadrant', () => {
    const theme = THEMES.park;
    const hint = quadrantHint({ cx: 40, cy: 40, theme });
    expect(hint.startsWith('>!')).toBe(true);
    expect(hint.endsWith('!<')).toBe(true);
    expect(hint.toLowerCase()).toContain('top-left');

    const se = quadrantHint({ cx: 280, cy: 190, theme });
    expect(se.toLowerCase()).toContain('bottom-right');
  });
});
