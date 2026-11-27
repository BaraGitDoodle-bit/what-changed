import type { StreakRecord, StreakView } from './types';
import { daysBetween } from './date';

export const STREAK_TIERS: Array<{ days: number; name: string; emoji: string }> = [
  { days: 3, name: 'Sharp Eye', emoji: '🧐' },
  { days: 7, name: 'Regular', emoji: '🔍' },
  { days: 14, name: 'Detective', emoji: '🕵️' },
  { days: 30, name: 'Curator', emoji: '📸' },
  { days: 100, name: 'Oracle', emoji: '👁️' },
];

export const MAX_SNOOZES = 3;
export const SNOOZE_EVERY = 7;

export function emptyStreak(): StreakRecord {
  return { streak: 0, lastPlayed: null, bestMs: 0, plays: 0, snoozes: 0 };
}

export function tierFor(streak: number): { name: string; emoji: string } | null {
  let found: { name: string; emoji: string } | null = null;
  for (const tier of STREAK_TIERS) {
    if (streak >= tier.days) found = { name: tier.name, emoji: tier.emoji };
  }
  return found;
}

export function nextTierFor(streak: number): { name: string; days: number } | null {
  for (const tier of STREAK_TIERS) {
    if (streak < tier.days) return { name: tier.name, days: tier.days };
  }
  return null;
}

export interface SolveOutcome {
  record: StreakRecord;
  earnedSnooze: boolean;
  usedSnooze: boolean;
  isNewDay: boolean;
}

/**
 * Streak maths.
 * - Only a completed solve calls this (attempts do not touch the streak).
 * - A gap of exactly one day continues the run.
 * - A gap of two days auto-spends one banked snooze; with none banked the run
 *   restarts at 1.
 * - Every 7 consecutive days banks one snooze (max 3).
 * - Replaying the same day never changes the streak.
 */
export function applySolve(
  previous: StreakRecord,
  dateKey: string,
  timeMs: number,
): SolveOutcome {
  const base: StreakRecord = { ...emptyStreak(), ...previous };
  const sameDay = base.lastPlayed === dateKey;

  if (sameDay) {
    return {
      record: {
        ...base,
        bestMs: base.bestMs > 0 ? Math.min(base.bestMs, timeMs) : timeMs,
      },
      earnedSnooze: false,
      usedSnooze: false,
      isNewDay: false,
    };
  }

  const gap = base.lastPlayed ? daysBetween(base.lastPlayed, dateKey) : Number.POSITIVE_INFINITY;

  let streak: number;
  let snoozes = base.snoozes;
  let usedSnooze = false;

  if (gap === 1) {
    streak = Math.max(1, base.streak) + 1;
  } else if (gap === 2 && snoozes > 0) {
    snoozes -= 1;
    usedSnooze = true;
    streak = Math.max(1, base.streak) + 1;
  } else {
    streak = 1;
  }

  let earnedSnooze = false;
  if (streak > 0 && streak % SNOOZE_EVERY === 0 && snoozes < MAX_SNOOZES) {
    snoozes += 1;
    earnedSnooze = true;
  }

  return {
    record: {
      streak,
      lastPlayed: dateKey,
      bestMs: base.bestMs > 0 ? Math.min(base.bestMs, timeMs) : timeMs,
      plays: base.plays + 1,
      snoozes,
    },
    earnedSnooze,
    usedSnooze,
    isNewDay: true,
  };
}

export function streakView(record: StreakRecord | null): StreakView {
  const rec = record ?? emptyStreak();
  return {
    streak: rec.streak,
    lastPlayed: rec.lastPlayed,
    bestMs: rec.bestMs > 0 ? rec.bestMs : null,
    plays: rec.plays,
    snoozes: rec.snoozes,
    tierName: tierFor(rec.streak)?.name ?? null,
    nextTier: nextTierFor(rec.streak),
  };
}
