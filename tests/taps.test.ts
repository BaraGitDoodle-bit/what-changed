import { describe, expect, it } from 'vitest';
import { generateScene } from '../src/server/core/generate';
import { resolveTap } from '../src/server/core/taps';
import {
  buildInitState,
  handlePing,
  handleTap,
  readLeaderboard,
  recordPractice,
  startRun,
} from '../src/server/core/game';
import { FakeStore } from './helpers/fake-store';
import type { Scene } from '../src/shared/types';

const DATE = '2026-12-02';
const scene: Scene = generateScene({ date: DATE, installId: 't5_test', salt: 'tap-tests' });

function tap(store: FakeStore, username: string, diffIndex: number, now: number) {
  const diff = scene.diffs[diffIndex]!;
  return handleTap({
    store,
    scene,
    date: DATE,
    username,
    now,
    nx: diff.cx / scene.width,
    ny: diff.cy / scene.height,
  });
}

async function solveAll(store: FakeStore, username: string, start: number) {
  let last = await tap(store, username, 0, start);
  for (let i = 1; i < scene.diffs.length; i++) {
    last = await tap(store, username, i, start + i * 600);
  }
  return last;
}

describe('server-authoritative tap resolution', () => {
  it('accepts a tap on a difference and returns only the matched bbox', async () => {
    const store = new FakeStore();
    const diff = scene.diffs[0]!;
    const response = await handleTap({
      store,
      scene,
      date: DATE,
      username: 'alice',
      now: 1_000_000,
      nx: diff.cx / scene.width,
      ny: diff.cy / scene.height,
    });

    expect(response.ok).toBe(true);
    expect(response.hit).toBe(true);
    expect(response.found).toBe(1);
    expect(response.bbox).toEqual(diff.bbox);
    expect(JSON.stringify(response)).not.toContain('"diffs"');
    expect(response.done).toBe(false);
  });

  it('counts a wrong tap as a miss and adds a 2s penalty to the clock', async () => {
    const store = new FakeStore();
    // Find a genuinely empty point rather than assuming a corner is empty.
    let empty = { x: 4, y: 4 };
    outer: for (let gx = 0.02; gx < 1; gx += 0.02) {
      for (let gy = 0.02; gy < 1; gy += 0.02) {
        const point = { x: gx * scene.width, y: gy * scene.height };
        if (!resolveTap(scene, [], point.x, point.y)) {
          empty = point;
          break outer;
        }
      }
    }
    const response = await handleTap({
      store,
      scene,
      date: DATE,
      username: 'bob',
      now: 5_000,
      nx: empty.x / scene.width,
      ny: empty.y / scene.height,
    });

    expect(response.hit).toBe(false);
    expect(response.missCount).toBe(1);
    expect(response.elapsedMs).toBeGreaterThanOrEqual(2_000);
  });

  it('rejects a claim within 250ms of the previous find', async () => {
    const store = new FakeStore();
    const first = await tap(store, 'carol', 0, 10_000);
    expect(first.hit).toBe(true);

    const tooFast = await tap(store, 'carol', 1, 10_120);
    expect(tooFast.ok).toBe(false);
    expect(tooFast.reason).toBe('too-fast');
    expect(tooFast.found).toBe(1);

    const later = await tap(store, 'carol', 1, 10_400);
    expect(later.ok).toBe(true);
    expect(later.hit).toBe(true);
    expect(later.found).toBe(2);
  });

  it('starts the clock on the first tap, not on page load', async () => {
    const store = new FakeStore();
    const started = await startRun(store, DATE, 'dave', 50_000);
    expect(started.startedAt).toBe(50_000);

    const response = await tap(store, 'dave', 0, 51_500);
    expect(response.hit).toBe(true);
    expect(response.elapsedMs).toBe(1_500);
    expect(response.result).toBeUndefined();
  });

  it('never ships the answer set in the init payload', async () => {
    const store = new FakeStore();
    const init = await buildInitState({
      store,
      scene,
      date: DATE,
      username: 'erin',
      postId: 't3_daily',
    });

    const json = JSON.stringify(init);
    expect(json).not.toContain('"diffs"');
    expect(json).not.toContain('"bbox"');
    expect(json).not.toContain('"anchor"');
    expect(json).not.toContain('"objectId"');
    expect(scene.diffs.every((d) => !json.includes(`"${d.id}"`))).toBe(true);
    expect(init.total).toBe(scene.diffs.length);
    expect(init.mode).toBe('scored');
  });
});

describe('ping economy', () => {
  it('costs 5s, gives a 64px zone that contains the target, and caps at 3', async () => {
    const store = new FakeStore();
    await startRun(store, DATE, 'frank', 1_000);

    for (let i = 1; i <= 3; i++) {
      const response = await handlePing({ store, scene, date: DATE, username: 'frank', now: 2_000 + i });
      expect(response.ok).toBe(true);
      expect(response.zone!.r).toBe(32);
      const target = scene.diffs[i - 1]!;
      const distance = Math.hypot(response.zone!.x - target.cx, response.zone!.y - target.cy);
      expect(distance).toBeLessThanOrEqual(response.zone!.r);
      expect(response.pingsLeft).toBe(3 - i);
    }

    const fourth = await handlePing({ store, scene, date: DATE, username: 'frank', now: 3_000 });
    expect(fourth.ok).toBe(false);
    expect(fourth.reason).toBe('no-pings');
  });

  it('adds the ping penalty to the final time', async () => {
    const store = new FakeStore();
    await startRun(store, DATE, 'gina', 10_000);
    await handlePing({ store, scene, date: DATE, username: 'gina', now: 10_100 });
    const result = await solveAll(store, 'gina', 10_200);
    expect(result.done).toBe(true);
    expect(result.result!.pings).toBe(1);
    expect(result.result!.timeMs).toBeGreaterThanOrEqual(5_000);
  });
});

describe('one scored run per user per day', () => {
  it('ranks the first complete solve and makes later runs unranked practice', async () => {
    const store = new FakeStore();
    const first = await solveAll(store, 'hank', 100_000);
    expect(first.done).toBe(true);
    expect(first.result!.scorable).toBe(true);
    expect(first.result!.rank).toBe(1);

    await recordPractice(store, DATE, 'hank', true);
    const second = await solveAll(store, 'hank', 200_000);
    expect(second.done).toBe(true);
    expect(second.result!.scorable).toBe(false);
    expect(second.result!.rank).toBe(1);

    const rows = await readLeaderboard(store, DATE);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.username).toBe('hank');
    expect(rows[0]!.timeMs).toBe(first.result!.timeMs);
  });

  it('records a practice flag on the run', async () => {
    const store = new FakeStore();
    const run = await recordPractice(store, DATE, 'ida', true);
    expect(run.practice).toBe(true);
    const init = await buildInitState({
      store,
      scene,
      date: DATE,
      username: 'ida',
      postId: null,
    });
    // No scored run yet for ida, so the UI still offers a scored attempt.
    expect(init.mode).toBe('scored');
  });
});
