# BUILD SUMMARY — WHAT CHANGED (Stage 2)

A complete Devvit Web daily spot-the-difference game, built exactly to
`CONCEPT.md` / `BUILD_BRIEF.md`. Every scene is generated from the date with a
seeded PRNG, validated for fairness before it is served, frozen in Redis against
the post's date, and resolved server-side so the browser never receives an
answer key.

**No login, upload, playtest, install, publish, subreddit creation or Devpost
action was performed. No paid API, key or credential was used. $0 spent.**

---

## 1. Stack

| Layer | Choice |
|---|---|
| Platform | Devvit Web `@devvit/web` 0.15.6, `devvit.json` |
| Client | React 19 + Tailwind 4, Vite 6, hand-authored SVG art |
| Server | Hono 4 + TypeScript, bundled to CommonJS with esbuild |
| Data | Devvit Redis (all state, per-installation = per-subreddit) |
| Scheduling | `devvit.json` scheduler tasks with CRON |
| Events | `onAppInstall`, `onAppUpgrade`, `onCommentCreate` triggers |
| Tests | Vitest 3 + jsdom, 58 tests in 9 files |

Virtual scene space is **320×220**, with 16px minimum footprint, 22px tap
tolerance, and a fixed `viewBox` so the same coordinates work at any CSS size.

---

## 2. Files

### Created — configuration
- `tsconfig.json` — strict TS, no emit, bundler resolution, React JSX
- `vite.config.ts` — client root `src/client`, output `dist/client`
- `vitest.config.ts` — node default, jsdom opt-in per file
- `devvit.json` — post entrypoint, server bundle, permissions, 3 triggers,
  4 CRON tasks, 2 subreddit settings
- `scripts/build-server.mjs` — esbuild server bundle → `dist/server/index.js`
- `scripts/inspect-scenes.tsx` — dev scene inspector, writes `inspect/scenes.html`

### Created — shared engine (`src/shared`)
- `types.ts` — scene/run/result/payload types + all fairness constants
- `rng.ts` — xmur3 + mulberry32 PRNG, weighted sampling without replacement
- `color.ts` — hex→Lab, CIE76 ΔE, WCAG contrast, colour names
- `date.ts` — UTC date keys, day numbers, weekday/day-of-year
- `difficulty.ts` — Mon–Fri 5, Sat 6, Sun 7 (Sweep) with per-op weights
- `streak.ts` — solve-only streaks, 7-day snooze banking, auto-spend, tiers
- `art-meta.ts` — 42 art kinds: size, primary colour, variants, op capabilities
- `themes.ts` — 4 themes × 16 authored slots on a fairness lattice, palettes,
  tint sets, hint place names
- `leaderboard.ts` — ordering, tie-breaks, median, percentile, top-10 view
- `share.ts` — clock/split formatting, exact share block, par rating, hint text

### Created — server (`src/server`)
- `index.ts` — Hono app, routes, error handler, Devvit server bootstrap
- `core/generate.ts` — composition, 7 difference ops, anchor selection,
  96px separation, 120-attempt deterministic retry, **and `validateScene()`**
- `core/taps.ts` — normalised→virtual coords, hit resolution, ping hot zones
- `core/game.ts` — run lifecycle, 250ms anti-spam, misses, pings, finalisation,
  one-scored-run-per-day, leaderboard/stats writes, streaks, init payload
- `core/keys.ts` — Redis schema from CONCEPT §5 (+ `wc:postdate`, `wc:share`,
  `wc:started`, run `pinged`/`lastFindAt` fields, documented in-file)
- `core/store.ts` / `core/redis-store.ts` — narrow Redis interface + adapter
- `core/hints.ts` — one `!hint` per user per day, spoiler-wrapped quadrant
- `core/publish.ts` — scene storage, rolling-median par, publish, recap,
  watchdog, install, flair (all idempotent with NX locks)
- `core/resolve-date.ts` — post → date mapping so old posts keep their board
- `routes/api.ts` — `/api/init|start|tap|ping|practice|share|health|inspect`
- `routes/triggers.ts` — install, upgrade, comment-create (`!hint`)
- `routes/cron.ts` — generate, publish, recap, watchdog
- `routes/reddit-adapter.ts` — string-typed Reddit interface, all ID casts here

### Created — client (`src/client`)
- `main.tsx`, `App.tsx`, `index.css`, `index.html`
- `api.ts` — typed fetch wrapper with 401/login handling
- `useGame.ts` — init, clock, taps, pings, result, practice, share, toasts
- `sound.ts` — WebAudio ticks (no audio assets), persisted mute
- `clipboard.ts` — clipboard API + textarea fallback
- `components/SceneSvg.tsx` — background, z-ordered objects, numbered rings,
  pulsing ping zone
- `components/ScenePanel.tsx` — pointer taps, 300ms hold magnifier, shake,
  normalised coordinates
- `components/Hud.tsx` — clock, progress, pings, mute, expand
- `components/ResultCard.tsx` — time, rank, percentile, splits, reveal labels,
  top-5 leaderboard, median/% perfect, snoovatar, copy/comment/practice
- `art/` — `common.tsx` (park/shared), `space.tsx`, `beach.tsx`, `market.tsx`,
  `Background.tsx`, `index.tsx` (catalogue + renderer dispatch), `types.ts`

### Created — tests (`tests`)
- `generation.test.ts` (7) — determinism, date/install variation, payload
  stripping, theme rotation, weekday counts
- `fairness.test.ts` (11) — 200 consecutive days valid; anchor, footprint,
  ΔE, edges, 96px; **negative cases** proving the validator rejects breaches
- `taps.test.ts` (9) — hit/miss, 250ms rejection, clock-on-first-tap, no answer
  leak, ping economy/containment/cap, one scored run per day
- `streak.test.ts` (9) — streak, replay, 7-day snooze, auto-spend, resets, tiers
- `leaderboard.test.ts` (5) — ordering, tie-breaks, rank, percentile, median
- `share.test.ts` (5) — exact share block, formats, spoiler quadrant
- `art-render.test.ts` (4) — every kind × variant renders; all four themes;
  rings/numbers; no NaN/undefined
- `golden.test.ts` (6) — SHA-256 frozen scenes on 5 dates + theme coverage
- `app-render.test.tsx` (2) — real App mounts in jsdom against a stubbed API:
  HUD/panels on a fresh board, result card after a full solve
- `helpers/fake-store.ts` — in-memory Redis double

### Modified
- `package.json` — `inspect:scenes` → `vite-node scripts/inspect-scenes.tsx`,
  added `test:art` (only change; existing deps/scripts untouched)

Generated artifacts (not source): `dist/client/`, `dist/server/index.js`,
`inspect/scenes.html`.

---

## 3. How to build, test, run

```bash
npm install
npm run typecheck     # tsc --noEmit
npm test              # vitest run
npm run build         # vite build + esbuild server bundle
npm run inspect:scenes  # writes inspect/scenes.html (30 days, both panels)
```

Local client-only dev: `npm run dev` (Vite at :5173, proxies `/api` to :3000).
There is **no local server runtime** without a Devvit install; the server
bundle is only validated by building it.

Optional: set `WHAT_CHANGED_SALT` to vary the generation salt per deployment.
The committed default is a public constant, not a secret.

---

## 4. Verification results (all run in this directory)

| Check | Command | Result |
|---|---|---|
| Install | `npm install --no-audit --no-fund` | **exit 0**, up to date |
| Typecheck | `npx tsc --noEmit` | **exit 0**, no errors |
| Tests | `npx vitest run` | **exit 0 — 58 passed / 9 files** |
| Build | `npm run build` | **exit 0** — client 281.81 kB JS (86.05 kB gzip), 17.90 kB CSS; server `dist/server/index.js` 3.2 MB |
| Scene inspector | `npm run inspect:scenes` | **exit 0** — 30 scenes, **0 validation failures** |
| Config schema | official `parseAppConfig(devvit.json)` | **OK** — 4 tasks, 3 triggers |

Test totals by file: app-render 2, art-render 4, fairness 11, generation 7,
golden 6, leaderboard 5, share 5, streak 9, taps 9.

The 200-day test covers every weekday curve (including ~28 Sundays at 7
differences) and asserts full fairness validation on every scene. The golden
test freezes five scenes by SHA-256 so any accidental art/generation drift is
caught.

**Nothing was faked:** no live scheduler run, Reddit call, or browser session
inside Reddit was available, so none is claimed below.

---

## 5. What is implemented (map to the brief)

- **§2 generation** — 4 themes, 16 authored slots each with z-order, seeded
  PRNG from date + install id + salt, all 7 ops, anchor + min footprint +
  ΔE ≥ 55 + 96px + edge inset, Mon 5 → Fri 5 → Sat 6 → Sun 7, scene frozen in
  Redis with 21-day TTL and a post→date mapping.
- **§3 systems** — solve-only streaks, one snooze banked per 7 days (cap 3),
  auto-spend on a one-day gap, daily per-sub leaderboard by time then pings
  then misses, median time + % who found all, copy/comment sharing in the
  exact timed-run format, spoiler nudge, `!hint` (one/user/day, quadrant,
  score-neutral), flair rewards at 3/7/14/30/100 with silent degradation.
- **§5 platform** — crons 23:55 / 00:00 / 20:00 / every 5 min; Redis keys per
  CONCEPT §5; install/upgrade/comment triggers; `submitCustomPost`,
  `submitComment`, `setUserFlair`, `setPostFlair`, `getCurrentUsername`,
  `getCurrentSubreddit`, `getPostById`, `getSnoovatarUrl`; server-authoritative
  taps, 250ms claim rejection, bbox-only responses, one scored run per day.
- **§6 mitigations** — 16px/22px limits, hold-to-magnify loupe, 360–560px
  responsive layout with expand-to-fullscreen, golden snapshots, 30-day
  inspector script, art render tests.
- **§7 feel** — clock starts on first tap (`/api/start` fired on first
  pointerdown), anchor near centre and large, result card with rank, splits,
  leaderboard, snoovatar and one-tap share.

---

## 6. Known gaps and deliberate deviations

1. **Weekly "Best Eye" board** (CONCEPT §3) is not built; the daily board,
   median and % perfect are. `wc:weekly` was removed rather than left dead.
2. **Post hour setting** (CONCEPT §5) is not exposed: the brief pins publish to
   `0 0 * * *`. Changing the hour means editing `devvit.json`.
3. **96px separation is centre-to-centre Euclidean.** On a 320×220 board, 7
   differences can only fit on a staggered lattice, so diff-bearing slots are
   fixed (no position jitter) and decor jitters instead. Validated over 200
   days, including all Sunday Sweeps.
4. **Answer confidentiality is structural, not pixel-level.** Both panels'
   object lists must be sent to draw them, so a player can always compare with
   their eyes (that *is* the game). The server never sends diff ops, bboxes,
   labels or anchor flags; unfound diffs are not enumerable from any response.
5. **Snooze cap is 3** (the concept specified earning, not a ceiling).
6. **Practice runs cannot be posted** to comments (`409 practice-run`), so a
   slower unranked time can never be shared as if it were scored.
7. A second `!hint` in a day gets a short "already used" reply, not a hint.
8. **Bot grid-scanning** is deterred only by the +2s/miss penalty and the 250ms
   claim lock; there is no hard per-user tap rate limit.
9. The server bundle is 3.2 MB because Hono and the Devvit client are bundled;
   it builds and is self-contained, but could be trimmed with externals.
10. **No visual review was performed.** The layout, art, loupe and mobile
    widths at 360/390/430px were not viewed in a browser (see UNVERIFIED).

---

## 7. UNVERIFIED (requires a live Devvit install, which was prohibited)

- `devvit login`, `upload`, `playtest`, `publish`, and any submission step.
- The scheduler actually firing at 23:55 / 00:00 / 20:00 / every 5 minutes and
  reaching the `/internal/cron/*` endpoints.
- `submitCustomPost`, `submitComment`, `setUserFlair`, `setPostFlair`,
  `getPostById` and `getSnoovatarUrl` against a real subreddit, including
  whether the sub permits user flair or post flair.
- Devvit Redis semantics (NX result string, TTLs, zset ranges) under the real
  plugin; the code is written against the shipped typings and tested against an
  in-memory double.
- Trigger payload shape at runtime. The comment trigger parses defensively
  (`comment.body`, `comment.postId`, `author.name`, fallbacks) but was never
  fed a real event.
- The server bundle booting inside the Devvit Node runtime (`serve` +
  `createServer` + `getServerPort`).
- The client inside Reddit's webview: iframe sizing, safe-area insets, hold
  magnifier feel, actual mobile layout at 360/390/430px, and real touch
  behaviour.
- A real daily leaderboard, tie-breaks against live players, streak carry-over
  across days, and flair assignment.
- `!hint` replies in a real comment thread.
