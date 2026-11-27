import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ART } from '../src/shared/art-meta';
import { RENDERERS, artKinds } from '../src/client/art';
import { SceneSvg } from '../src/client/components/SceneSvg';
import { generateScene, toPublicScene } from '../src/server/core/generate';

describe('SVG art catalogue', () => {
  it('has a renderer for every catalogue kind and no strays', () => {
    expect([...artKinds()].sort()).toEqual(Object.keys(ART).sort());
  });

  it('renders every kind and variant with real geometry', () => {
    for (const [kind, meta] of Object.entries(ART)) {
      const Renderer = RENDERERS[kind]!;
      for (const variant of meta.variants) {
        const markup = renderToStaticMarkup(
          createElement(Renderer, {
            w: meta.w,
            h: meta.h,
            variant,
            fill: meta.primary,
            ink: '#20312B',
          }),
        );
        expect(markup, `${kind}/${variant}`).toContain('<');
        expect(markup.length, `${kind}/${variant}`).toBeGreaterThan(30);
        expect(markup, `${kind}/${variant}`).not.toContain('undefined');
        expect(markup, `${kind}/${variant}`).not.toContain('NaN');
      }
    }
  });

  it('renders full scenes for all four themes without NaN geometry', () => {
    const dates = ['2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04'];
    const themes = new Set<string>();
    for (const date of dates) {
      const scene = toPublicScene(
        generateScene({ date, installId: 'art-test', salt: 'art-test-salt' }),
      );
      themes.add(scene.theme);
      const markup = renderToStaticMarkup(
        createElement(SceneSvg, { scene, panel: 'before', rings: [] }),
      );
      expect(markup).toContain('<svg');
      expect(markup).not.toContain('NaN');
      expect(markup).toContain('viewBox');
    }
    expect(themes.size).toBe(4);
  });

  it('renders found rings with numbers and no answer labels', () => {
    const scene = toPublicScene(generateScene({ date: '2026-12-05', installId: 'a', salt: 'b' }));
    const markup = renderToStaticMarkup(
      createElement(SceneSvg, {
        scene,
        panel: 'after',
        rings: [
          { id: 'ring-1', bbox: { x: 20, y: 20, w: 40, h: 30 } },
          { id: 'ring-2', bbox: { x: 200, y: 150, w: 30, h: 30 } },
        ],
      }),
    );
    expect(markup).toContain('stroke-dasharray');
    expect(markup).toContain('>1<');
    expect(markup).toContain('>2<');
  });
});
