/**
 * Dev-only scene inspector. Renders 30 days of generated scenes to a single
 * static HTML file so an author can eyeball layouts, palettes and ring
 * placement at once. Run with: npm run inspect:scenes
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { addDays, todayKey } from '../src/shared/date';
import { generateScene, toPublicScene, validateScene } from '../src/server/core/generate';
import { SceneSvg } from '../src/client/components/SceneSvg';

const DAYS = 30;
const outDir = 'inspect';
const outFile = `${outDir}/scenes.html`;

async function main() {
  const start = todayKey();
  const cards: string[] = [];
  const failures: string[] = [];

  for (let i = 0; i < DAYS; i++) {
    const date = addDays(start, i);
    const scene = generateScene({
      date,
      installId: process.env.WHAT_CHANGED_INSPECT_INSTALL ?? 'inspect-install',
      salt: process.env.WHAT_CHANGED_SALT ?? 'inspect-salt',
    });
    const issues = validateScene(scene);
    if (issues.length > 0) failures.push(`${date}: ${issues.join('; ')}`);

    const pub = toPublicScene(scene);
    const before = renderToStaticMarkup(
      <SceneSvg scene={pub} panel="before" rings={[]} />,
    );
    const after = renderToStaticMarkup(<SceneSvg scene={pub} panel="after" rings={[]} />);

    cards.push(`
      <article class="card">
        <header>
          <strong>#${scene.dayNumber} · ${date} · ${scene.themeName}</strong>
          <span>${scene.diffs.length} changes · ${scene.diffs
            .map((d) => d.op)
            .join(', ')}</span>
        </header>
        <div class="panels">
          <div class="panel">${before}</div>
          <div class="panel">${after}</div>
        </div>
        <ul>${scene.diffs.map((d) => `<li>${d.label} <em>(${Math.round(d.cx)},${Math.round(d.cy)})</em></li>`).join('')}</ul>
      </article>`);
  }

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>What Changed — scene inspector</title>
<style>
  body { background:#0b141b; color:#f4efe4; font:13px/1.4 ui-sans-serif,system-ui,sans-serif; margin:0; padding:20px; }
  h1 { font-size:16px; letter-spacing:.14em; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:16px; }
  .card { background:#101d26; border:1px solid #29414f; border-radius:10px; padding:10px; }
  .card header { display:flex; flex-direction:column; gap:2px; margin-bottom:6px; font-size:11px; color:#9fb3c2; }
  .card header strong { color:#f4efe4; font-size:12px; }
  .panels { display:grid; gap:6px; }
  .panel { border:2px solid #29414f; border-radius:8px; overflow:hidden; background:#0f1c25; }
  .panel svg { display:block; width:100%; height:auto; }
  ul { margin:8px 0 0; padding-left:16px; color:#c9d6df; font-size:11px; }
  em { color:#7fd1f2; font-style:normal; }
  .fail { color:#ff9f9f; }
</style></head>
<body>
  <h1>WHAT CHANGED — 30 day scene inspector</h1>
  <p>${failures.length === 0 ? 'All scenes pass fairness validation.' : `<span class="fail">${failures.length} invalid scenes</span>`}</p>
  <div class="grid">${cards.join('')}</div>
</body></html>`;

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, html, 'utf8');
  console.log(`Wrote ${outFile} (${DAYS} scenes, ${failures.length} validation failures)`);
  if (failures.length > 0) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  }
}

void main();
