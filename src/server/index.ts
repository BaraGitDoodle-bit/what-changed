import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort } from '@devvit/web/server';
import { apiRoutes } from './routes/api';
import { cronRoutes } from './routes/cron';
import { triggerRoutes } from './routes/triggers';

const app = new Hono();

app.route('/', apiRoutes);
app.route('/', triggerRoutes);
app.route('/', cronRoutes);

app.notFound((c) => c.json({ ok: false, error: 'not-found' }, 404));

app.onError((error, c) => {
  console.error('unhandled route error', error);
  return c.json({ ok: false, error: 'server-error' }, 500);
});

serve({
  fetch: app.fetch,
  createServer: createServer as unknown as typeof import('node:http').createServer,
  port: getServerPort(),
});
