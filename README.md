# WHAT CHANGED

A daily spot-the-difference game for Reddit, built with Devvit Web for the Game of the Day Hackathon.

Every day, two hand-drawn SVG cartoon panels appear side by side. They look identical — they aren't. Find every difference before the clock runs out.

## How it plays

- One board a day, generated from the date seed. Monday–Friday boards hide 5 differences, Saturday 6, and the Sunday Sweep hides 7.
- Tap a difference to ring it. A wrong tap costs +2s. Three pings per run reveal a 64px hot zone around an unfound difference (+5s each).
- Streaks: solve on consecutive days to build a streak. A 7-day streak banks a snooze (max 3) that covers one missed day automatically.
- Daily per-subreddit leaderboard ranked by time, then pings, then misses, plus median time and the share of players who found everything.
- Share your timed run as a comment in the exact share format. Practice runs never post.
- Comment `!hint` once a day for one spoiler-wrapped quadrant hint. Streak flair at 3 / 7 / 14 / 30 / 100 days (skipped silently if the subreddit has flair off).

## Fairness, by construction

- Scenes are generated with a seeded PRNG and validated before serving: minimum 16px footprint, colour distance ΔE ≥ 55, 96px centre-to-centre separation, edge insets, 200 consecutive days validated in tests.
- Taps resolve server-side. The browser never receives diff positions, bounding boxes, or answer labels — only the two panels and the diffs already found.

## Tech

Devvit Web 0.15.6 · React 19 + Tailwind 4 + Vite 6 (client) · Hono 4 + TypeScript, esbuild bundle (server) · Devvit Redis (all state) · Vitest 3 + jsdom (58 tests).

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run build       # vite build + esbuild server bundle
npm run inspect:scenes  # renders 30 days of scenes to inspect/scenes.html
```

`devvit upload` / `devvit playtest` from a logged-in Devvit CLI. Set `WHAT_CHANGED_SALT` to vary the generation salt per deployment (the committed default is a public constant, not a secret).

## Layout

- `src/shared/` — deterministic engine: seeded RNG, generation, fairness, streaks, leaderboard, share format.
- `src/server/` — Hono API (`init/start/tap/ping/practice/share`), cron + trigger routes, Redis store.
- `src/client/` — React game UI, hand-authored SVG art (4 themes), hold-to-magnify loupe.
- `tests/` — generation, fairness, taps, streaks, leaderboard, share, art render, golden snapshots, app render.
