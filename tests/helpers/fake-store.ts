import type { Store } from '../../src/server/core/store';

interface ZEntry {
  member: string;
  score: number;
}

/** In-memory Redis double: strings, hashes and sorted sets. */
export class FakeStore implements Store {
  readonly strings = new Map<string, string>();
  readonly hashes = new Map<string, Map<string, string>>();
  readonly zsets = new Map<string, Map<string, number>>();
  readonly expiries = new Map<string, number>();

  private hash(key: string): Map<string, string> {
    let h = this.hashes.get(key);
    if (!h) {
      h = new Map();
      this.hashes.set(key, h);
    }
    return h;
  }

  private zset(key: string): Map<string, number> {
    let z = this.zsets.get(key);
    if (!z) {
      z = new Map();
      this.zsets.set(key, z);
    }
    return z;
  }

  async get(key: string): Promise<string | undefined> {
    return this.strings.get(key);
  }

  async set(
    key: string,
    value: string,
    opts?: { nx?: boolean; ttlSeconds?: number },
  ): Promise<string | null> {
    if (opts?.nx && this.strings.has(key)) return null;
    this.strings.set(key, value);
    if (opts?.ttlSeconds) this.expiries.set(key, opts.ttlSeconds);
    return 'OK';
  }

  async del(...keys: string[]): Promise<void> {
    for (const key of keys) {
      this.strings.delete(key);
      this.hashes.delete(key);
      this.zsets.delete(key);
    }
  }

  async exists(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.strings.has(key) || this.hashes.has(key) || this.zsets.has(key)) count += 1;
    }
    return count;
  }

  async expire(key: string, seconds: number): Promise<void> {
    this.expiries.set(key, seconds);
  }

  async incrBy(key: string, amount: number): Promise<number> {
    const next = Number(this.strings.get(key) ?? 0) + amount;
    this.strings.set(key, String(next));
    return next;
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    return this.hashes.get(key)?.get(field);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return Object.fromEntries(this.hash(key));
  }

  async hSet(key: string, values: Record<string, string>): Promise<number> {
    const h = this.hash(key);
    let added = 0;
    for (const [field, value] of Object.entries(values)) {
      if (!h.has(field)) added += 1;
      h.set(field, value);
    }
    return added;
  }

  async hDel(key: string, fields: string[]): Promise<number> {
    const h = this.hash(key);
    let removed = 0;
    for (const field of fields) {
      if (h.delete(field)) removed += 1;
    }
    return removed;
  }

  async hIncrBy(key: string, field: string, amount: number): Promise<number> {
    const h = this.hash(key);
    const next = Number(h.get(field) ?? 0) + amount;
    h.set(field, String(next));
    return next;
  }

  async zAdd(key: string, member: string, score: number): Promise<number> {
    const z = this.zset(key);
    const existed = z.has(member);
    z.set(member, score);
    return existed ? 0 : 1;
  }

  private sorted(key: string): ZEntry[] {
    return [...this.zset(key).entries()]
      .map(([member, score]) => ({ member, score }))
      .sort((a, b) => a.score - b.score || a.member.localeCompare(b.member));
  }

  async zRange(key: string, start: number, stop: number): Promise<ZEntry[]> {
    const entries = this.sorted(key);
    const end = stop < 0 ? entries.length + stop + 1 : stop + 1;
    return entries.slice(start, end);
  }

  async zRank(key: string, member: string): Promise<number | undefined> {
    const index = this.sorted(key).findIndex((entry) => entry.member === member);
    return index >= 0 ? index : undefined;
  }

  async zCard(key: string): Promise<number> {
    return this.zset(key).size;
    }
}
