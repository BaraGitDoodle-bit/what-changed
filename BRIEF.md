# BRIEF — Design a daily game for Reddit's Game of the Day Hackathon (STAGE 1: concept only)

You are an AI coding assistant. Your operator wants YOU to design the game — not
build it yet. Read this brief fully, then do STAGE 1 ONLY. Work ONLY in this
directory. Do not use any paid API, secret, or credential. Spend $0. If a step needs
a login, a key, or money, SKIP it and record it as not done.

## 1. The contest (facts, verified 26 Nov 2026)

- Reddit's Game of the Day Hackathon on Devpost. Submission period ends Tuesday,
  December 8, 2026, 6:00 pm Pacific Time (= Wednesday, December 9, 2026, 09:00 WIB).
  Judging December 9–16 PT. Winners ~December 17 PT.
- Prizes: Best Daily Game $15,000 (1 winner), Best Ported Daily Game $6,000 (1),
  Honorable Mentions $1,000 (10). Total $35,000.
- Eligibility: individuals worldwide except US-sanctioned countries. The builder is
  in Indonesia: ELIGIBLE. Multiple submissions per entrant are allowed, but each
  must be unique and substantially different from the entrant's other submissions.
- The builder already has a DIFFERENT submitted entry (a text adventure game). THIS
  project must be substantially different from a text adventure.
- Judging definition of a "daily game": a bite-sized daily experience with enough
  variety and replayability to keep players coming back. Easy to learn, satisfying
  daily loop, seamlessly integrated into Reddit. BONUS points for layering in Reddit
  features: flair, comments, snoovatars, streaks.
- The tech stack will be Devvit Web ONLY (@devvit/web, React 19 + Tailwind 4,
  Hono/Express + TypeScript server, Devvit Redis, scheduler with CRON). The old
  Blocks framework is dead. You do not need to build anything in this stage — but
  the concept MUST be buildable on this stack with no external services.

## 2. STAGE 1 — your only job in this run

Choose ONE game concept and write it to CONCEPT.md in this directory. Then STOP and
wait for the next instruction. Do NOT write any game code yet. Do NOT create a
Devvit project yet.

### Hard constraints on the concept
- It must be a DAILY game: one small shared experience per day, under 3 minutes to
  play, learnable in 60 seconds, with a reason to return tomorrow (streaks,
  leaderboard, evolving content, community comparison).
- It must be fun in the first 30 seconds, playable on a phone, and playable entirely
  inside a Reddit post (no downloads, no accounts beyond Reddit).
- It must use at least two Reddit-native hooks (streaks, comments/sharing,
  leaderboard per subreddit, flair rewards, daily scheduled post).

### FORBIDDEN concepts (proven occupied — do NOT pick these or close variants)
1. ANY word game, in English OR Indonesian (Wordle-style, Spelling Bee-style, word
   squares, emoji-word, word deduction). The builder explicitly rejected a word game.
2. Pixel canvas / collaborative pixel art / drawing-and-guessing games.
3. Prediction games of any kind (sports scores, "what will the community pick",
   voting/consensus games).
4. Sports companions / live-score boards.
5. Ports or clones of NYT games (Wordle, Connections, Strands) or of r/place.
6. Anything that is a reskin of the builder's text adventure game.

### CONCEPT.md must contain
1. Game name + one-sentence pitch.
2. Core loop: what the player DOES each day, step by step (max 6 steps).
3. What changes every day (the daily content source — must NOT need a paid API or
   manual daily work by a human).
4. Streaks, leaderboard, and sharing design (how results travel into comments).
5. Honest differentiation: one paragraph explaining why this is NOT a duplicate of
   any forbidden concept above or of any well-known Devvit game (name the closest
   existing games and say exactly how this differs). If you cannot honestly pass
   this test, SAY SO in CONCEPT.md instead of inventing a weak concept — a failed
   concept stage is a useful result.
6. The Devvit features it uses (scheduler, Redis keys, triggers, Reddit API calls).
7. The 3 biggest risks to winning, stated plainly.
8. What the first 30 seconds feel like for a brand-new player.

## 3. When CONCEPT.md is written

Print exactly this line and then WAIT (do nothing else):
CONCEPT DONE

Do not start building. Do not create other files except CONCEPT.md. Do not attempt
any login, upload, or submission.
