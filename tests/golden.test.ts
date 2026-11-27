import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { generateScene } from '../src/server/core/generate';
import type { Scene } from '../src/shared/types';

/**
 * Golden scenes lock the procedural illustrator. If a scene changes, this test
 * fails on purpose: either the change is a bug, or you update the goldens and
 * say so in the changelog.
 */
const GOLDEN: Record<string, string> = {
  '2026-12-01': 'ada6978a08e79edb39a3b32aa8f25abdcf4191aeb40f32bbd0804f6991e5818a',
  '2026-12-02': '9a388c9935e9712de0600239d0856e7bc5ef3f8a77996d34a8627f6b70b2f044',
  '2026-12-03': '7e20211d3c0dcf7bcbc9ca9d1818ba8f1ba09c76c63f7a360323942784f2e7fa',
  '2026-12-04': 'f5035b7883cf422380b2982f2f035a0868b219b3b8ffb146b1ca5b0c3ac76f47',
  '2026-12-06': '0f525f52123dabd7ed910943dd28f102b6091cbe5431dfcf9ca2dc267207b91b',
};

function hashScene(scene: Scene): string {
  return createHash('sha256').update(JSON.stringify(scene)).digest('hex');
}

describe('golden scenes', () => {
  for (const [date, expected] of Object.entries(GOLDEN)) {
    it(`matches the frozen scene for ${date}`, () => {
      const scene = generateScene({ date, installId: 'golden-install', salt: 'golden-salt' });
      expect(hashScene(scene)).toBe(expected);
    });
  }

  it('covers all four launch themes', () => {
    const themes = Object.keys(GOLDEN).map(
      (date) => generateScene({ date, installId: 'golden-install', salt: 'golden-salt' }).theme,
    );
    expect(new Set(themes).size).toBe(4);
  });
});
