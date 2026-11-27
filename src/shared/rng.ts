/** Deterministic seeded PRNG. Same inputs => same bytes, on every machine. */

export function hashString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private readonly nextValue: () => number;

  constructor(seed: number) {
    this.nextValue = mulberry32(seed);
  }

  next(): number {
    return this.nextValue();
  }

  /** Integer in [0, n). */
  int(n: number): number {
    if (n <= 0) return 0;
    return Math.floor(this.next() * n);
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  intRange(min: number, max: number): number {
    return min + this.int(max - min + 1);
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('pick() from empty list');
    return items[this.int(items.length)]!;
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      const a = out[i]!;
      out[i] = out[j]!;
      out[j] = a;
    }
    return out;
  }

  /**
   * Weighted sample without replacement (Efraimidis-Spirakis): sort by
   * u^(1/w) descending. Stable for a given rng stream.
   */
  weightedOrder<T>(items: readonly T[], weightOf: (item: T) => number): T[] {
    return items
      .map((item) => {
        const w = Math.max(0.0001, weightOf(item));
        return { item, key: Math.pow(this.next(), 1 / w) };
      })
      .sort((a, b) => b.key - a.key)
      .map((entry) => entry.item);
  }
}

export function rngFor(...parts: Array<string | number>): Rng {
  return new Rng(hashString(parts.join('|')));
}
