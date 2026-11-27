/** UTC date helpers. The game day is always the UTC calendar day. */

export const DAY_EPOCH = '2026-12-01';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

export function todayKey(now: Date = new Date()): string {
  return toDateKey(now);
}

export function addDays(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateKey(d);
}

export function daysBetween(from: string, to: string): number {
  const a = parseDateKey(from).getTime();
  const b = parseDateKey(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** 0 = Sunday ... 6 = Saturday, matching Date#getUTCDay. */
export function weekdayIndex(key: string): number {
  return parseDateKey(key).getUTCDay();
}

/** 0-based day of year. */
export function dayOfYear(key: string): number {
  const d = parseDateKey(key);
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor((d.getTime() - start) / 86_400_000);
}

/** Stable 1-based puzzle number; launch day is #1. */
export function dayNumberFor(key: string): number {
  return daysBetween(DAY_EPOCH, key) + 1;
}

export function isoWeekdayName(key: string): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    weekdayIndex(key)
  ]!;
}
