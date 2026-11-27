import { Hono } from 'hono';
import { context, redis, reddit, settings } from '@devvit/web/server';
import { isDateKey, todayKey } from '../../shared/date';
import { handleHint } from '../core/hints';
import { keys } from '../core/keys';
import { ensureScene, handleInstall, loadStoredScene, publishDaily } from '../core/publish';
import { createRedisStore } from '../core/redis-store';
import { redditLike } from './reddit-adapter';

export const triggerRoutes = new Hono();

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

triggerRoutes.post('/internal/triggers/app-install', async (c) => {
  try {
    const result = await handleInstall({
      store: store(),
      reddit: redditLike,
      subredditName: await subredditName(),
      installId: installId(),
      salt: salt(),
      today: todayKey(),
    });
    return c.json({ ok: true, ...result });
  } catch (error) {
    // A failed first post must never block the install. The watchdog retries.
    console.error('install trigger failed', error);
    return c.json({ ok: false, error: 'install-failed' });
  }
});

triggerRoutes.post('/internal/triggers/app-upgrade', async (c) => {
  try {
    const s = store();
    const date = todayKey();
    await ensureScene({ store: s, date, installId: installId(), salt: salt() });
    if (!(await s.get(keys.posted(date)))) {
      await publishDaily({
        store: s,
        reddit: redditLike,
        subredditName: await subredditName(),
        date,
        installId: installId(),
        salt: salt(),
      });
    }
    return c.json({ ok: true });
  } catch (error) {
    console.error('upgrade trigger failed', error);
    return c.json({ ok: false, error: 'upgrade-failed' });
  }
});

interface CommentTriggerPayload {
  comment?: {
    id?: string;
    body?: string;
    postId?: string;
    author?: { name?: string };
  };
  author?: { name?: string };
  post?: { id?: string };
}

triggerRoutes.post('/internal/triggers/comment-create', async (c) => {
  try {
    const payload = (await c.req.json().catch(() => ({}))) as CommentTriggerPayload;
    const body = (payload.comment?.body ?? '').trim().toLowerCase();
    if (body !== '!hint') return c.json({ ok: true, ignored: 'not-a-hint' });

    let hEnabled = true;
    try {
      hEnabled = (await settings.get<boolean>('hintReplies')) !== false;
    } catch {
      hEnabled = true;
    }
    if (!hEnabled) return c.json({ ok: true, ignored: 'hints-disabled' });

    const commentId = payload.comment?.id;
    const username = payload.author?.name ?? payload.comment?.author?.name;
    const postId = payload.comment?.postId ?? payload.post?.id ?? null;
    if (!commentId || !username || !postId) {
      return c.json({ ok: true, ignored: 'missing-fields' });
    }

    const s = store();
    const date = await s.get(keys.postDate(postId));
    if (!isDateKey(date)) return c.json({ ok: true, ignored: 'not-the-daily-post' });

    const scene = (await loadStoredScene(s, date)) ??
      (await ensureScene({ store: s, date, installId: installId(), salt: salt() }));

    const hint = await handleHint(s, scene, date, username);
    if (hint.replied && hint.text) {
      await redditLike.submitComment({ id: commentId, text: hint.text });
    } else if (hint.alreadyUsed) {
      await redditLike.submitComment({
        id: commentId,
        text: "You've already used today's hint — one per player per day. Back tomorrow.",
      });
    }
    return c.json({ ok: true, replied: hint.replied, alreadyUsed: hint.alreadyUsed });
  } catch (error) {
    console.error('comment trigger failed', error);
    return c.json({ ok: false, error: 'comment-trigger-failed' });
  }
});
