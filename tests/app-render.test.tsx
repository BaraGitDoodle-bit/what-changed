// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/client/App';
import { FakeStore } from './helpers/fake-store';
import { buildInitState } from '../src/server/core/game';
import { generateScene } from '../src/server/core/generate';

const DATE = '2026-12-02';
const scene = generateScene({ date: DATE, installId: 'render-test', salt: 'render-salt' });

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  vi.restoreAllMocks();
});

async function mountWith(init: Awaited<ReturnType<typeof buildInitState>>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/init')) return jsonResponse(init);
    return jsonResponse({ ok: true });
  });
  vi.stubGlobal('fetch', fetchMock);

  await act(async () => {
    root.render(<App />);
  });
  // Flush the init fetch + state updates.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return fetchMock;
}

describe('client app mount', () => {
  it('renders the two panels, HUD and streak from a real init payload', async () => {
    const store = new FakeStore();
    const init = await buildInitState({
      store,
      scene,
      date: DATE,
      username: 'tester',
      postId: 't3_render',
    });

    const fetchMock = await mountWith(init);

    expect(fetchMock).toHaveBeenCalled();
    expect(container.textContent).toContain('WHAT CHANGED');
    expect(container.textContent).toContain('BEFORE');
    expect(container.textContent).toContain('AFTER');
    expect(container.textContent).toContain(`0/${scene.diffs.length}`);
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).toContain('No streak yet — today is day one.');
  });

  it('renders the finished result card without a second scored run', async () => {
    const store = new FakeStore();
    const { handleTap } = await import('../src/server/core/game');
    let now = 500_000;
    for (const diff of scene.diffs) {
      await handleTap({
        store,
        scene,
        date: DATE,
        username: 'solver',
        now,
        nx: diff.cx / scene.width,
        ny: diff.cy / scene.height,
      });
      now += 700;
    }

    const init = await buildInitState({
      store,
      scene,
      date: DATE,
      username: 'solver',
      postId: 't3_render',
    });

    await mountWith(init);

    expect(container.textContent).toContain('ALL FOUND');
    expect(container.textContent).toContain('SPLITS');
    expect(container.textContent).toContain('Copy result');
    expect(container.textContent).toContain('Play again');
  });
});
