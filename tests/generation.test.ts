import { describe, expect, it } from 'vitest';
import { addDays, weekdayIndex } from '../src/shared/date';
import { planForWeekday } from '../src/shared/difficulty';
import { generateScene, sceneSignature, toPublicScene, validateScene } from '../src/server/core/generate';

const BASE = { installId: 't5_testsub', salt: 'unit-test-salt' };

describe('seeded generation determinism', () => {
  it('produces an identical scene for the same date + install id + salt', () => {
    const date = '2026-12-02';
    const a = generateScene({ ...BASE, date });
    const b = generateScene({ ...BASE, date });

    expect(a).toEqual(b);
    expect(sceneSignature(a)).toBe(sceneSignature(b));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('changes the board for a different date', () => {
    const a = generateScene({ ...BASE, date: '2026-12-02' });
    const b = generateScene({ ...BASE, date: '2026-12-03' });
    expect(sceneSignature(a)).not.toBe(sceneSignature(b));
  });

  it('changes the board for a different install id on the same day', () => {
    const date = '2027-01-11';
    const a = generateScene({ ...BASE, installId: 't5_one', date });
    const b = generateScene({ ...BASE, installId: 't5_two', date });
    expect(sceneSignature(a)).not.toBe(sceneSignature(b));
  });

  it('freezes the scene payload without the answer key', () => {
    const scene = generateScene({ ...BASE, date: '2026-12-02' });
    const publicScene = toPublicScene(scene);
    const json = JSON.stringify(publicScene);

    expect(publicScene.total).toBe(scene.diffs.length);
    expect(json).not.toContain('"diffs"');
    expect(json).not.toContain('"bbox"');
    expect(json).not.toContain('"anchor"');
    expect(json).not.toContain('"op"');
    expect(json).not.toContain('"label"');
    expect(json).not.toContain(scene.diffs[0]!.id);
  });

  it('rotates themes across four consecutive days', () => {
    const themes = ['2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04'].map(
      (date) => generateScene({ ...BASE, date }).theme,
    );
    expect(new Set(themes).size).toBe(4);
  });
});

describe('weekday difficulty curve', () => {
  it('maps Mon-Fri to 5, Saturday to 6 and Sunday to 7', () => {
    expect(planForWeekday(1).count).toBe(5);
    expect(planForWeekday(2).count).toBe(5);
    expect(planForWeekday(3).count).toBe(5);
    expect(planForWeekday(4).count).toBe(5);
    expect(planForWeekday(5).count).toBe(5);
    expect(planForWeekday(6).count).toBe(6);
    expect(planForWeekday(0).count).toBe(7);
    expect(planForWeekday(0).label).toBe('Sunday Sweep');
  });

  it('publishes exactly the plan count for every weekday', () => {
    let date = '2026-12-07'; // Monday
    for (let day = 0; day < 14; day++) {
      const scene = generateScene({ ...BASE, date });
      const plan = planForWeekday(weekdayIndex(date));
      expect(scene.diffs.length).toBe(plan.count);
      expect(validateScene(scene, plan.count)).toEqual([]);
      date = addDays(date, 1);
    }
  });
});
