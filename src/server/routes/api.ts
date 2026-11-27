import { Hono } from 'hono';
import { context, redis, reddit, settings } from '@devvit/web/server';
import { todayKey } from '../../shared/date';
import {
  buildInitState,
  buildResult,
  handlePing,
  handleTap,
  loadRun,
  readStreak,
  recordPractice,
  startRun,
} from '../core/game';
import { keys } from '../core/keys';
import { applyStreakFlair, ensureScene, loadStoredScene, previewScenes } from '../core/publish';
import { createRedisStore } from '../core/redis-store';
import { resolveDateForRequest } from '../core/resolve-date';
import { redditLike } from './reddit-adapter';
import type { Scene } from '../../shared/types';

export const apiRoutes = new Hono();

function store() {
  return createRedisStore(redis);
}

function installId(): string {
  return context.subredditId ?? context.appSlug ?? 'what-changed';
}

function salt(): string {
  return process.env.WHAT_CHANGED_SALT ?? 'what-changed-public-salt-v1';
}

interface Actor {
  username: string;
  subredditName: string;
  postId: string | null;
}

async function actor(): Promise<Actor | null> {
  const username = context.username ?? (await reddit.getCurrentUsername());
  if (!username) return null;
  const subredditName = context.subredditName ?? (await reddit.getCurrentSubreddit()).name;
  return { username, subredditName, postId: context.postId ?? null };
}

function postDataDate(): unknown {
  const data = context.postData;
  return data && typeof data === 'object' ? (data as Record<string, unknown>).date : undefined;
}

async function sceneFor(postId: string | null): Promise<{ scene: Scene; date: string }> {
  const s = store();
  const date = await resolveDateForRequest({ store: s, postId, postDataDate: postDataDate() });
  const stored = await loadStoredScene(s, date);
  if (stored) return { scene: stored, date };
  const scene = await ensureScene({ store: s, date, installId: installId(), salt: salt() });
  return { scene, date };
}

async function snoovatarFor(username: string): Promise<string | null> {
  if (context.snoovatar) return context.snoovatar;
  try {
    return (await reddit.getSnoovatarUrl(username)) ?? null;
  } catch {
    return null;
  }
}

async function flairEnabled(): Promise<boolean> {
  try {
    const value = await settings.get<boolean>('flairRewards');
    return value !== false;
  } catch {
    return true;
  }
}

apiRoutes.use('/api/*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store');
});

apiRoutes.get('/api/health', (c) => c.json({ ok: true, date: todayKey() }));

apiRoutes.get('/api/init', async (c) => {
  const me = await actor();
  if (!me) return c.json({ ok: false, error: 'login-required' }, 401);

  const { scene, date } = await sceneFor(me.postId);
  const init = await buildInitState({
    store: store(),
    scene,
    date,
    username: me.username,
    postId: me.postId,
  });

  if (init.mode === 'done') {
    init.snoovatar = await snoovatarFor(me.username);
  }
  return c.json(init);
});

apiRoutes.post('/api/start', async (c) => {
  const me = await actor();
  if (!me) return c.json({ ok: false, error: 'login-required' }, 401);
  const { date } = await sceneFor(me.postId);
  const run = await startRun(store(), date, me.username, Date.now());
  return c.json({ ok: true, startedAt: run.startedAt });
});

apiRoutes.post('/api/tap', async (c) => {
  const me = await actor();
  if (!me) return c.json({ ok: false, error: 'login-required' }, 401);

  const body = (await c.req.json().catch(() => ({}))) as { x?: unknown; y?: unknown };
  const x = Number(body.x);
  const y = Number(body.y);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) {
    return c.json({ ok: false, error: 'bad-coordinates' }, 400);
  }

  const { scene, date } = await sceneFor(me.postId);
  const response = await handleTap({
    store: store(),
    scene,
    date,
    username: me.username,
    now: Date.now(),
    nx: x,
    ny: y,
  });

  if (response.result?.scorable) {
    const streak = await readStreak(store(), me.username);
    const label = await applyStreakFlair({
      reddit: redditLike,
      subredditName: me.subredditName,
      username: me.username,
      streak: streak.streak,
      enabled: await flairEnabled(),
    });
    if (label) response.result.flair = label;
  }

  return c.json(response);
});

apiRoutes.post('/api/ping', async (c) => {
  const me = await actor();
  if (!me) return c.json({ ok: false, error: 'login-required' }, 401);
  const { scene, date } = await sceneFor(me.postId);
  const response = await handlePing({
    store: store(),
    scene,
    date,
    username: me.username,
    now: Date.now(),
  });
  return c.json(response);
});

apiRoutes.post('/api/practice', async (c) => {
  const me = await actor();
  if (!me) return c.json({ ok: false, error: 'login-required' }, 401);
  const { date } = await sceneFor(me.postId);
  const alreadyScored = (await store().exists(keys.done(date, me.username))) > 0;
  const run = await recordPractice(store(), date, me.username, alreadyScored);
  return c.json({ ok: true, practice: run.practice, alreadyScored });
});

apiRoutes.post('/api/share', async (c) => {
  const me = await actor();
  if (!me) return c.json({ ok: false, error: 'login-required' }, 401);
  if (!me.postId) return c.json({ ok: false, error: 'no-post' }, 400);

  const s = store();
  const { scene, date } = await sceneFor(me.postId);
  const run = await loadRun(s, date, me.username);
  if (!run.doneAt) return c.json({ ok: false, error: 'run-not-finished' }, 409);
  if (run.practice) return c.json({ ok: false, error: 'practice-run' }, 409);

  const existing = await s.get(keys.share(date, me.username));
  const streak = await readStreak(s, me.username);
  const result = await buildResult(s, scene, date, me.username, run, true, streak);

  if (existing) return c.json({ ok: true, already: true, permalink: existing, text: result.share });

  const comment = await redditLike.submitComment({ id: me.postId, text: result.share });
  const permalink = comment.permalink ?? '';
  await s.set(keys.share(date, me.username), permalink, { ttlSeconds: 30 * 24 * 60 * 60 });
  return c.json({ ok: true, already: false, permalink, text: result.share });
});

/** Dev-only scene inspector (30 days at once). Disabled in production builds. */
apiRoutes.get('/api/inspect', async (c) => {
  if (process.env.NODE_ENV === 'production') {
    return c.json({ ok: false, error: 'not-found' }, 404);
  }
  const days = Math.min(31, Math.max(1, Number(c.req.query('days') ?? 30)));
  const preview = await previewScenes({
    installId: installId(),
    salt: salt(),
    fromDate: todayKey(),
    days,
  });
  return c.json({ ok: true, ...preview });
});
