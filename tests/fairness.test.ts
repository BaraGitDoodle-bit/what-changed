import { describe, expect, it } from 'vitest';
import { ART } from '../src/shared/art-meta';
import { deltaE } from '../src/shared/color';
import { addDays, weekdayIndex } from '../src/shared/date';
import { planForWeekday } from '../src/shared/difficulty';
import {
  MIN_AREA,
  MIN_DELTA_E,
  MIN_DIFF_SEPARATION,
  SAFE_INSET,
  VH,
  VW,
} from '../src/shared/types';
import { generateScene, validateScene } from '../src/server/core/generate';
import type { Scene } from '../src/shared/types';

const BASE = { installId: 't5_testsub', salt: 'unit-test-salt' };

function cloneScene(scene: Scene): Scene {
  return JSON.parse(JSON.stringify(scene)) as Scene;
}

describe('fairness validation', () => {
  it('keeps 200 consecutive daily scenes valid', () => {
    let date = '2026-12-01';
    const themes = new Set<string>();
    for (let day = 0; day < 200; day++) {
      const plan = planForWeekday(weekdayIndex(date));
      const scene = generateScene({ ...BASE, date });
      const issues = validateScene(scene, plan.count);
      expect(issues, `day ${date} (${scene.theme})`).toEqual([]);
      themes.add(scene.theme);
      date = addDays(date, 1);
    }
    expect(themes.size).toBe(4);
  });

  it('always includes one large anchor near the centre', () => {
    let date = '2026-12-01';
    for (let day = 0; day < 60; day++) {
      const scene = generateScene({ ...BASE, date });
      const anchors = scene.diffs.filter((d) => d.anchor);
      expect(anchors).toHaveLength(1);
      const [anchor] = anchors;
      expect(anchor!.bbox.w * anchor!.bbox.h).toBeGreaterThanOrEqual(1_200);
      expect(Math.abs(anchor!.cx - VW / 2)).toBeLessThanOrEqual(85);
      expect(Math.abs(anchor!.cy - VH / 2)).toBeLessThanOrEqual(75);
      date = addDays(date, 1);
    }
  });

  it('enforces minimum footprint and colour distance', () => {
    const scene = generateScene({ ...BASE, date: '2026-12-09' });
    for (const diff of scene.diffs) {
      expect(diff.bbox.w).toBeGreaterThanOrEqual(16);
      expect(diff.bbox.h).toBeGreaterThanOrEqual(16);
      expect(diff.bbox.w * diff.bbox.h).toBeGreaterThanOrEqual(MIN_AREA);
    }

    const recolour = scene.diffs.find((d) => d.op === 'recolor');
    if (recolour) {
      const before = scene.before.find((o) => o.id === recolour.objectId)!;
      const after = scene.after.find((o) => o.id === recolour.objectId)!;
      const from = before.tint ?? ART[before.kind]!.primary;
      const to = after.tint ?? ART[after.kind]!.primary;
      // CIE76 check duplicated here so the rule is independently asserted.
      expect(deltaE(from, to)).toBeGreaterThanOrEqual(MIN_DELTA_E);
    }
  });

  it('keeps every difference off the panel edges', () => {
    let date = '2026-12-01';
    for (let day = 0; day < 45; day++) {
      const scene = generateScene({ ...BASE, date });
      for (const diff of scene.diffs) {
        expect(diff.bbox.x).toBeGreaterThanOrEqual(SAFE_INSET);
        expect(diff.bbox.y).toBeGreaterThanOrEqual(SAFE_INSET);
        expect(diff.bbox.x + diff.bbox.w).toBeLessThanOrEqual(VW - SAFE_INSET);
        expect(diff.bbox.y + diff.bbox.h).toBeLessThanOrEqual(VH - SAFE_INSET);
      }
      date = addDays(date, 1);
    }
  });

  it('enforces 96px separation between differences', () => {
    let date = '2026-12-01';
    for (let day = 0; day < 45; day++) {
      const scene = generateScene({ ...BASE, date });
      for (let i = 0; i < scene.diffs.length; i++) {
        for (let j = i + 1; j < scene.diffs.length; j++) {
          const a = scene.diffs[i]!;
          const b = scene.diffs[j]!;
          expect(Math.hypot(a.cx - b.cx, a.cy - b.cy)).toBeGreaterThanOrEqual(
            MIN_DIFF_SEPARATION,
          );
        }
      }
      date = addDays(date, 1);
    }
  });
});

describe('validator rejects broken scenes', () => {
  const scene = generateScene({ ...BASE, date: '2026-12-09' });

  it('rejects a diff moved next to another diff', () => {
    const broken = cloneScene(scene);
    broken.diffs[1]!.cx = broken.diffs[0]!.cx + 10;
    broken.diffs[1]!.cy = broken.diffs[0]!.cy;
    expect(validateScene(broken).join(' ')).toContain('closer than');
  });

  it('rejects a diff that touches a UI edge', () => {
    const broken = cloneScene(scene);
    broken.diffs[0]!.bbox.x = 0;
    expect(validateScene(broken).join(' ')).toContain('panel edge');
  });

  it('rejects a diff below the minimum footprint', () => {
    const broken = cloneScene(scene);
    broken.diffs[0]!.bbox.w = 4;
    broken.diffs[0]!.bbox.h = 4;
    expect(validateScene(broken).join(' ')).toContain('minimum footprint');
  });

  it('rejects a scene without exactly one anchor', () => {
    const broken = cloneScene(scene);
    for (const diff of broken.diffs) diff.anchor = false;
    expect(validateScene(broken).join(' ')).toContain('exactly one anchor');
  });

  it('rejects a recolour below the colour-distance floor', () => {
    const target = scene.diffs.find((d) => d.op === 'recolor');
    if (!target) return;
    const broken = cloneScene(scene);
    const before = broken.before.find((o) => o.id === target.objectId)!;
    const after = broken.after.find((o) => o.id === target.objectId)!;
    after.tint = before.tint ?? ART[before.kind]!.primary;
    expect(validateScene(broken).join(' ')).toContain('colour-distance floor');
  });

  it('rejects a diff whose op does not match the scene delta', () => {
    const target = scene.diffs.find((d) => d.op !== 'add' && d.op !== 'remove');
    if (!target) return;
    const broken = cloneScene(scene);
    const before = broken.before.find((o) => o.id === target.objectId)!;
    const after = broken.after.find((o) => o.id === target.objectId)!;
    Object.assign(after, before);
    expect(validateScene(broken).join(' ')).toContain('does not explain');
  });
});
