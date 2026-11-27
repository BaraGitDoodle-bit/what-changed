import { describe, expect, it } from 'vitest';
import { addDays } from '../src/shared/date';
import { applySolve, emptyStreak, tierFor } from '../src/shared/streak';
import type { StreakRecord } from '../src/shared/types';

function daysOf(streak: StreakRecord, from: string, count: number): StreakRecord {
  let record = streak;
  let date = from;
  for (let i = 0; i < count; i++) {
    record = applySolve(record, date, 40_000).record;
    date = addDays(date, 1);
  }
  return record;
}

describe('streak maths', () => {
  it('starts at 1 on the first solve', () => {
    const outcome = applySolve(emptyStreak(), '2026-12-01', 41_000);
    expect(outcome.record.streak).toBe(1);
    expect(outcome.record.plays).toBe(1);
    expect(outcome.record.lastPlayed).toBe('2026-12-01');
  });

  it('does not change on a same-day replay', () => {
    const first = applySolve(emptyStreak(), '2026-12-01', 41_000).record;
    const replay = applySolve(first, '2026-12-01', 20_000);
    expect(replay.record.streak).toBe(1);
    expect(replay.record.plays).toBe(1);
    expect(replay.isNewDay).toBe(false);
    expect(replay.record.bestMs).toBe(20_000);
  });

  it('continues on consecutive days', () => {
    let record = emptyStreak();
    let date = '2026-12-01';
    for (let day = 1; day <= 6; day++) {
      record = applySolve(record, date, 40_000).record;
      expect(record.streak).toBe(day);
      date = addDays(date, 1);
    }
  });

  it('banks one snooze at 7 consecutive days', () => {
    const six = daysOf(emptyStreak(), '2026-12-01', 6);
    expect(six.snoozes).toBe(0);
    const seventh = applySolve(six, '2026-12-07', 40_000);
    expect(seventh.record.streak).toBe(7);
    expect(seventh.earnedSnooze).toBe(true);
    expect(seventh.record.snoozes).toBe(1);
  });

  it('auto-spends one snooze on a single missed day', () => {
    const seven = daysOf(emptyStreak(), '2026-12-01', 7);
    expect(seven.snoozes).toBe(1);

    // Skip 2026-12-08 entirely, then play on the 9th.
    const back = applySolve(seven, '2026-12-09', 40_000);
    expect(back.usedSnooze).toBe(true);
    expect(back.record.streak).toBe(8);
    expect(back.record.snoozes).toBe(0);
  });

  it('resets when the missed day cannot be paid for', () => {
    const seven = daysOf(emptyStreak(), '2026-12-01', 7);
    const noSnooze: StreakRecord = { ...seven, snoozes: 0 };
    const back = applySolve(noSnooze, '2026-12-09', 40_000);
    expect(back.usedSnooze).toBe(false);
    expect(back.record.streak).toBe(1);
  });

  it('resets after two or more missed days even with a snooze banked', () => {
    const seven = daysOf(emptyStreak(), '2026-12-01', 7);
    const back = applySolve(seven, '2026-12-10', 40_000);
    expect(back.record.streak).toBe(1);
    expect(back.record.snoozes).toBe(1);
  });

  it('keeps the best time across days', () => {
    let record = emptyStreak();
    record = applySolve(record, '2026-12-01', 90_000).record;
    record = applySolve(record, '2026-12-02', 40_000).record;
    record = applySolve(record, '2026-12-03', 60_000).record;
    expect(record.bestMs).toBe(40_000);
  });

  it('maps streaks to flair tiers', () => {
    expect(tierFor(2)).toBeNull();
    expect(tierFor(3)!.name).toBe('Sharp Eye');
    expect(tierFor(7)!.name).toBe('Regular');
    expect(tierFor(14)!.name).toBe('Detective');
    expect(tierFor(30)!.name).toBe('Curator');
    expect(tierFor(100)!.name).toBe('Oracle');
    expect(tierFor(250)!.name).toBe('Oracle');
  });
});
