import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';

await mkdir('dist/server', { recursive: true });

await build({
  entryPoints: ['src/server/index.ts'],
  outfile: 'dist/server/index.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: false,
  logLevel: 'info',
  // Devvit ships the bundle into its Node runtime; only builtins stay external.
  external: ['node:*'],
  banner: {
    js: '/* what-changed server bundle */',
  },
});
