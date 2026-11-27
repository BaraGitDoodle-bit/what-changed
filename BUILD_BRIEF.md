# BUILD BRIEF — Stage 2: implement WHAT CHANGED (Devvit Web daily game)

You are an AI coding assistant. First read CONCEPT.md (the approved design) and
BRIEF.md (the contest facts) in this directory, fully. Then implement the game
exactly as CONCEPT.md specifies. Work ONLY in this directory. Spend $0. Do not
use any paid API, secret, or credential. If a step needs a login, a key, or
money, SKIP it and record it as not done.

## 1. What to build

A complete Devvit Web app for Reddit's Game of the Day Hackathon, implementing
every section of CONCEPT.md:

- **Stack:** Devvit Web ONLY — `@devvit/web`, React 19 + Tailwind 4 client,
  Hono + TypeScript server, Devvit Redis, scheduler with CRON, triggers.
  Use the standard @devvit/web project layout (`package.json`, `src/client`,
  `src/server`, `devvit.json` or equivalent config, `vite` config). If the
  scaffolding command needs interactive answers, choose: web template,
  TypeScript, app name `what-changed`. Never run any login, upload, playtest,
  or publish command.
- **§2 Generation:** 4 launch themes (Park Afternoon, Space Station, Beach Day,
  Night Market), 14–20 hand-authored slots per theme with z-order, seeded PRNG
  (date + install id + private salt), 7 difference ops (remove / add / recolor /
  flip / scale / swapVariant / nudge), fairness validation (one large
  high-contrast anchor near the centre; minimum rendered area and colour
  distance per difference; no two differences within 96px; no difference under
  a UI edge), weekday difficulty curve (Mon 5 obvious → Fri 5 subtle → Sat 6 →
  Sun "Sweep" 7), scene frozen in Redis per post id (no mid-day re-rolls).
- **§3 Game systems:** streaks (solve-only counting, one snooze per 7 days,
  auto-spend on one missed day), per-subreddit daily leaderboard (time ascending,
  tie-break fewer pings then fewer misses; median time + % perfect shown),
  sharing (copy + comment, timed-run format with splits, spoiler-norm nudge),
  `!hint` comment trigger (one per user per day, spoiler-wrapped quadrant, no
  score effect), flair rewards (mod-toggleable, graceful degradation).
- **§5 Platform:** scheduler crons (generate 23:55 UTC, publish 00:00 UTC,
  recap comment 20:00 UTC, watchdog every 5 min), Redis schema exactly as
  specified in CONCEPT.md §5, triggers (onAppInstall, onCommentCreate,
  onAppUpgrade), Reddit API calls used in CONCEPT.md, and the
  server-authoritative design: the client NEVER receives the answer set; taps
  send normalised {x, y}; the server resolves against the scene, rejects
  claims within 250ms of the previous find, returns only the matched bbox +
  progress; one scored run per user per day, later runs are unranked practice.
- **§6 mitigations:** minimum 16px rendered footprint / 22px hit tolerance at
  320×220 virtual space, tap-to-zoom loupe, responsive layout that works at
  360/390/430px widths, golden-scene snapshot tests, dev-only scene inspector
  route or script to eyeball 30 days of scenes at once.
- **§7 feel:** clock starts on the FIRST tap, anchor difference findable in
  ~4 seconds, result card with rank + splits + one-tap share.

## 2. Tests (mandatory, must all pass)

Use vitest (fall back to node:test only if vitest cannot install). Cover:
- Seeded generation determinism: same date + install id → identical scene;
  different date → different scene.
- Fairness validation: anchor present; min area/contrast enforced; 96px
  separation enforced; no edge overlap.
- Tap resolution: no answer leak to client (assert the scene payload sent to
  the client contains no diff coordinates); 250ms anti-spam; one scored run
  per day.
- Streak/snooze math, including the missed-day auto-spend.
- Leaderboard ordering and tie-breaks.
- 200 consecutive days of generation: all valid, all solvable-by-construction
  (every diff is an applied op on a placed object).

## 3. Self-checks before finishing

Run, in this directory: `npm install`, `npm run build`, `npm test`, and
`tsc --noEmit` (or the typecheck script). ALL must be green. Fix failures
yourself; do not declare done with a red build. No external services. No
secrets or keys anywhere in the repo. No dead placeholder art that breaks
the render — every SVG component must render.

## 4. Hard limits

- NO devvit login, upload, playtest, install, or submission. NO subreddit
  creation. NO Devpost action. NO credential use of any kind.
- NO network calls at runtime to anything except Reddit/Devvit platform APIs.
  Build-time npm installs are fine.
- Do NOT delete or rewrite CONCEPT.md or BRIEF.md.
- If something cannot be verified without a live Devvit install (e.g. the
  scheduler actually posting), record it as UNVERIFIED in BUILD_SUMMARY.md —
  never fake a verification.

## 5. When finished

Write BUILD_SUMMARY.md in this directory: every file created, how to run the
build and tests, the test results, known gaps, and everything UNVERIFIED.
Then print exactly this line and WAIT (do nothing else):
BUILD DONE
