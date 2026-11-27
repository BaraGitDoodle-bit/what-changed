import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import { addDays, todayKey } from '../../shared/date';
import { ensureScene, postRecap, publishDaily, runWatchdog } from '../core/publish';
import { createRedisStore } from '../core/redis-store';
import { redditLike } from './reddit-adapter';

export const cronRoutes = new Hono();

function store() {
  return createRedisStore(redis);
}

function installId(): string {
  return context.subredditId ?? context.appSlug ?? 'what-changed';
}

function salt(): string {
  return process.env.WHAT_CHANGED_SALT ?? 'what-changed-public-salt-v1';
}

async function subredditName(): Promise<string> {
  return context.subredditName ?? (await reddit.getCurrentSubreddit()).name;
}

cronRoutes.post('/internal/cron/generate', async (c) => {
  try {
    const today = todayKey();
    const scene = await ensureScene({
      store: store(),
      date: addDays(today, 1),
      installId: installId(),
      salt: salt(),
    });
    return c.json({ ok: true, generated: scene.date, diffs: scene.diffs.length });
  } catch (error) {
    console.error('generate cron failed', error);
    return c.json({ ok: false, error: 'generate-failed' });
  }
});

cronRoutes.post('/internal/cron/publish', async (c) => {
  try {
    const result = await publishDaily({
      store: store(),
      reddit: redditLike,
      subredditName: await subredditName(),
      date: todayKey(),
      installId: installId(),
      salt: salt(),
    });
    return c.json({ ok: true, ...result });
  } catch (error) {
    console.error('publish cron failed', error);
    return c.json({ ok: false, error: 'publish-failed' });
  }
});

cronRoutes.post('/internal/cron/recap', async (c) => {
  try {
    const result = await postRecap({
      store: store(),
      reddit: redditLike,
      date: todayKey(),
    });
    return c.json({ ok: true, ...result });
  } catch (error) {
    console.error('recap cron failed', error);
    return c.json({ ok: false, error: 'recap-failed' });
  }
});

cronRoutes.post('/internal/cron/watchdog', async (c) => {
  try {
    const result = await runWatchdog({
      store: store(),
      reddit: redditLike,
      subredditName: await subredditName(),
      installId: installId(),
      salt: salt(),
      today: todayKey(),
    });
    return c.json({ ok: true, ...result });
  } catch (error) {
    console.error('watchdog failed', error);
    return c.json({ ok: false, error: 'watchdog-failed' });
  }
});
