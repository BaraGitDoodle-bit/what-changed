/**
 * The small slice of Redis the game uses. Keeping it behind an interface lets
 * the run/tap/leaderboard logic be tested against an in-memory double.
 */
export interface Store {
  get(key: string): Promise<string | undefined>;
  /** Resolves 'OK' when written, null when an NX write lost the race. */
  set(key: string, value: string, opts?: { nx?: boolean; ttlSeconds?: number }): Promise<string | null>;
  del(...keys: string[]): Promise<void>;
  exists(...keys: string[]): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  incrBy(key: string, amount: number): Promise<number>;
  hGet(key: string, field: string): Promise<string | undefined>;
  hGetAll(key: string): Promise<Record<string, string>>;
  hSet(key: string, values: Record<string, string>): Promise<number>;
  hDel(key: string, fields: string[]): Promise<number>;
  hIncrBy(key: string, field: string, amount: number): Promise<number>;
  zAdd(key: string, member: string, score: number): Promise<number>;
  zRange(key: string, start: number, stop: number): Promise<Array<{ member: string; score: number }>>;
  zRank(key: string, member: string): Promise<number | undefined>;
  zCard(key: string): Promise<number>;
}

export function isLockAcquired(result: string | null): boolean {
  return result !== null && result !== undefined && result !== '';
}
