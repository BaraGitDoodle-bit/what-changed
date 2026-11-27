import { addDays, todayKey } from '../../shared/date';
import { median } from '../../shared/leaderboard';
import { formatClock } from '../../shared/share';
import { tierFor } from '../../shared/streak';
import { generateScene, toPublicScene } from './generate';
import { keys, SCENE_TTL_SECONDS } from './keys';
import { isLockAcquired, type Store } from './store';
import type { Scene } from '../../shared/types';

/** Structural subset of the Devvit Reddit client used by the daily pipeline. */
export interface RedditLike {
  submitCustomPost(opts: {
    subredditName: string;
    title: string;
    entry?: string;
    postData?: Record<string, string>;
    textFallback?: { text: string };
  }): Promise<{ id: string; permalink?: string }>;
  submitComment(opts: { id: string; text: string }): Promise<{ id: string; permalink?: string }>;
  setPostFlair(opts: {
    subredditName: string;
    postId: string;
    text?: string;
    backgroundColor?: string;
    textColor?: 'dark' | 'light';
  }): Promise<void>;
  setUserFlair(opts: {
    subredditName: string;
    username: string;
    text?: string;
    backgroundColor?: string;
    textColor?: 'dark' | 'light';
  }): Promise<void>;
  getPostById(id: string): Promise<{ id: string; removed: boolean; spam: boolean }>;
}

const DAY_TTL = 30 * 24 * 60 * 60;

export async function loadStoredScene(store: Store, date: string): Promise<Scene | null> {
  const raw = await store.get(keys.scene(date));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Scene;
  } catch {
    return null;
  }
}

export async function storeScene(store: Store, scene: Scene): Promise<void> {
  await store.set(keys.scene(scene.date), JSON.stringify(scene), { ttlSeconds: SCENE_TTL_SECONDS });
  await store.hSet(keys.meta(scene.date), {
    theme: scene.theme,
    diffCount: String(scene.diffs.length),
    parMs: String(scene.parMs),
    dayNumber: String(scene.dayNumber),
    anchorId: scene.diffs.find((d) => d.anchor)?.id ?? '',
  });
  await store.expire(keys.meta(scene.date), SCENE_TTL_SECONDS);
}

/** Rolling 7-day median solve time; par is set from it when history exists. */
export async function recentMedianMs(store: Store, date: string): Promise<number | null> {
  const times: number[] = [];
  for (let i = 1; i <= 7; i++) {
    const day = addDays(date, -i);
    const rows = await store.zRange(keys.leaderboard(day), 0, -1);
    for (const row of rows) {
      if (Number.isFinite(row.score) && row.score > 0) times.push(row.score);
    }
  }
  return median(times);
}

/**
 * Idempotent scene generation. The generation lock keeps duplicate cron runs
 * from doing the work twice; if the lock is held and the scene still does not
 * exist, this run generates anyway because the result is deterministic.
 */
export async function ensureScene(input: {
  store: Store;
  date: string;
  installId: string;
  salt: string;
}): Promise<Scene> {
  const { store, date, installId, salt } = input;
  const existing = await loadStoredScene(store, date);
  if (existing) return existing;

  const lock = await store.set(keys.genLock(date), '1', { nx: true, ttlSeconds: 300 });
  if (!isLockAcquired(lock)) {
    const retry = await loadStoredScene(store, date);
    if (retry) return retry;
  }

  const scene = generateScene({
    date,
    installId,
    salt,
    recentMedianMs: await recentMedianMs(store, date),
  });
  await storeScene(store, scene);
  return scene;
}

/** Daily post. One-shot per date via `wc:posted:{date}`. */
export async function publishDaily(input: {
  store: Store;
  reddit: RedditLike;
  subredditName: string;
  date: string;
  installId: string;
  salt: string;
}): Promise<{ posted: boolean; postId: string | null; reason?: string }> {
  const { store, reddit, subredditName, date, installId, salt } = input;

  const already = await store.get(keys.posted(date));
  if (already) return { posted: false, postId: already, reason: 'already-posted' };

  const lock = await store.set(keys.publishLock(date), '1', { nx: true, ttlSeconds: 180 });
  if (!isLockAcquired(lock)) {
    return { posted: false, postId: await store.get(keys.posted(date)) ?? null, reason: 'locked' };
  }

  const scene = await ensureScene({ store, date, installId, salt });

  const post = await reddit.submitCustomPost({
    subredditName,
    title: `What Changed #${scene.dayNumber} — ${scene.themeName}`,
    entry: 'default',
    postData: { date },
    textFallback: {
      text: `Same place. Two moments. Find ${scene.diffs.length} changes. Open the post on new Reddit to play.`,
    },
  });

  await store.set(keys.posted(date), post.id, { ttlSeconds: DAY_TTL });
  await store.set(keys.postDate(post.id), date, { ttlSeconds: DAY_TTL });
  await store.set(keys.day, String(scene.dayNumber));
  await store.del(keys.publishLock(date));

  try {
    await reddit.setPostFlair({
      subredditName,
      postId: post.id,
      text: 'Daily Puzzle',
      backgroundColor: '#1F3B4D',
      textColor: 'light',
    });
  } catch {
    // Subreddits can disable post flair. The game must not care.
  }

  return { posted: true, postId: post.id };
}

export async function publishTomorrow(input: {
  store: Store;
  date: string;
  installId: string;
  salt: string;
}): Promise<Scene> {
  return ensureScene({ ...input, date: addDays(input.date, 1) });
}

/** 20:00 UTC recap comment, one-shot via `wc:recap:{date}`. */
export async function postRecap(input: {
  store: Store;
  reddit: RedditLike;
  date: string;
}): Promise<{ posted: boolean; reason?: string }> {
  const { store, reddit, date } = input;
  if (await store.exists(keys.recap(date))) return { posted: false, reason: 'already-posted' };
  const postId = await store.get(keys.posted(date));
  if (!postId) return { posted: false, reason: 'no-post' };

  try {
    const post = await reddit.getPostById(postId);
    if (post.removed || post.spam) return { posted: false, reason: 'post-gone' };
  } catch {
    // A transient lookup failure should not burn the recap; carry on.
  }

  const stats = await store.hGetAll(keys.stats(date));
  const solvers = Number(stats.solvers ?? 0);
  const started = Number(stats.started ?? 0);
  if (solvers === 0) return { posted: false, reason: 'no-solvers' };

  const rows = await store.zRange(keys.leaderboard(date), 0, -1);
  const times = rows.map((r) => r.score).filter((t) => Number.isFinite(t) && t > 0);
  const med = median(times);
  const fastest = times.length > 0 ? Math.min(...times) : null;
  const perfectPct = started > 0 ? Math.round((solvers / started) * 100) : 100;

  const scene = await loadStoredScene(store, date);
  const total = scene?.diffs.length ?? 0;

  const text = [
    `**What Changed #${scene?.dayNumber ?? '?'} recap**`,
    '',
    `👀 ${started} started · 🔍 ${perfectPct}% found all ${total} · ⏱ median ${
      med === null ? '—' : formatClock(med)
    }`,
    fastest === null ? '' : `🏆 Fastest today: **${formatClock(fastest)}**`,
    '',
    'New scene at 00:00 UTC. Comments are spoiler-tagged — be kind to the people still looking.',
  ]
    .filter((line) => line !== '')
    .join('\n');

  await reddit.submitComment({ id: postId, text });
  await store.set(keys.recap(date), '1', { ttlSeconds: DAY_TTL });
  return { posted: true };
}

/** Every 5 minutes: repair a missing post or a missing scene. */
export async function runWatchdog(input: {
  store: Store;
  reddit: RedditLike;
  subredditName: string;
  installId: string;
  salt: string;
  today: string;
}): Promise<{ published: boolean; generatedTomorrow: boolean }> {
  const { store, reddit, subredditName, installId, salt, today } = input;
  let published = false;

  if (!(await store.get(keys.posted(today)))) {
    const result = await publishDaily({ store, reddit, subredditName, date: today, installId, salt });
    published = result.posted;
  }

  let generatedTomorrow = false;
  const tomorrow = addDays(today, 1);
  if (!(await store.get(keys.scene(tomorrow)))) {
    await ensureScene({ store, date: tomorrow, installId, salt });
    generatedTomorrow = true;
  }

  return { published, generatedTomorrow };
}

export async function handleInstall(input: {
  store: Store;
  reddit: RedditLike;
  subredditName: string;
  installId: string;
  salt: string;
  today: string;
}): Promise<{ posted: boolean; postId: string | null }> {
  const { store, reddit, subredditName, installId, salt, today } = input;
  if (!(await store.get(keys.day))) await store.set(keys.day, '0');
  const result = await publishDaily({ store, reddit, subredditName, date: today, installId, salt });
  await ensureScene({ store, date: addDays(today, 1), installId, salt });
  return { posted: result.posted, postId: result.postId };
}

const FLAIR_COLOURS: Record<string, string> = {
  'Sharp Eye': '#2F6B4F',
  Regular: '#2C5C7A',
  Detective: '#4B3D7A',
  Curator: '#7A4B2C',
  Oracle: '#7A2C4B',
};

/**
 * Flair is a reward, never a requirement: any Reddit permission error is
 * swallowed and the in-app badge still renders.
 */
export async function applyStreakFlair(input: {
  reddit: RedditLike;
  subredditName: string;
  username: string;
  streak: number;
  enabled: boolean;
}): Promise<string | null> {
  const { reddit, subredditName, username, streak, enabled } = input;
  if (!enabled) return null;
  const tier = tierFor(streak);
  if (!tier) return null;
  const label = `${tier.emoji} ${tier.name}`;
  try {
    await reddit.setUserFlair({
      subredditName,
      username,
      text: label,
      backgroundColor: FLAIR_COLOURS[tier.name] ?? '#2C5C7A',
      textColor: 'light',
    });
    return label;
  } catch {
    return null;
  }
}

/** Public scenes for the dev-only inspector. Never includes the answer key. */
export async function previewScenes(input: {
  installId: string;
  salt: string;
  fromDate: string;
  days: number;
}): Promise<{ scenes: ReturnType<typeof toPublicScene>[] }> {
  const scenes = [];
  for (let i = 0; i < input.days; i++) {
    const date = addDays(input.fromDate, i);
    const scene = generateScene({ date, installId: input.installId, salt: input.salt });
    scenes.push(toPublicScene(scene));
  }
  return { scenes };
}

