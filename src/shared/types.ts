/**
 * Shared types between the Devvit server, the React client and the tests.
 *
 * The scene is authored against a fixed 320x220 virtual space. Every tap is
 * normalised to that space, so hit-testing is resolution independent.
 */

export const VW = 320;
export const VH = 220;

/** No difference may sit closer than this to a panel edge. */
export const SAFE_INSET = 10;
/** Rendered footprint floor for a difference (virtual px). */
export const MIN_SIDE = 16;
export const MIN_AREA = 320;
/** Minimum CIE76 colour distance for a recolour difference. */
export const MIN_DELTA_E = 55;
/** No two differences may share a 96px radius (centre to centre). */
export const MIN_DIFF_SEPARATION = 96;
/** Tap tolerance in virtual px. */
export const TAP_TOLERANCE = 22;

export type ThemeId = 'park' | 'space' | 'beach' | 'market';

export type OpKind =
  | 'remove'
  | 'add'
  | 'recolor'
  | 'flip'
  | 'scale'
  | 'swapVariant'
  | 'nudge';

export const ALL_OPS: OpKind[] = [
  'remove',
  'add',
  'recolor',
  'flip',
  'scale',
  'swapVariant',
  'nudge',
];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlacedObject {
  id: string;
  kind: string;
  variant: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  flip: boolean;
  tint?: string;
}

export interface Diff {
  id: string;
  op: OpKind;
  slotId: string;
  objectId: string;
  bbox: Rect;
  cx: number;
  cy: number;
  radius: number;
  anchor: boolean;
  label: string;
}

export interface Scene {
  v: 1;
  date: string;
  dayNumber: number;
  theme: ThemeId;
  themeName: string;
  width: number;
  height: number;
  before: PlacedObject[];
  after: PlacedObject[];
  /** Server-side answer key. Never sent to the client. */
  diffs: Diff[];
  parMs: number;
}

/** What the browser is allowed to see: both panels, never the answer set. */
export interface PublicScene {
  v: 1;
  date: string;
  dayNumber: number;
  theme: ThemeId;
  themeName: string;
  width: number;
  height: number;
  before: PlacedObject[];
  after: PlacedObject[];
  total: number;
  parMs: number;
}

export interface RunState {
  startedAt: number;
  lastFindAt: number;
  found: string[];
  splits: number[];
  /** Diff ids already covered by a ping, so each ping reveals a new zone. */
  pinged: string[];
  pings: number;
  misses: number;
  doneAt: number;
  timeMs: number;
  practice: boolean;
}

export interface StreakRecord {
  streak: number;
  lastPlayed: string | null;
  bestMs: number;
  plays: number;
  snoozes: number;
}

export interface LeaderEntry {
  username: string;
  timeMs: number;
  pings: number;
  misses: number;
}

export interface LeaderRow extends LeaderEntry {
  rank: number;
}

export interface LeaderboardView {
  rows: LeaderRow[];
  solvers: number;
  yourRank: number | null;
  beatPct: number | null;
  medianMs: number | null;
  perfectPct: number | null;
}

export interface StreakView {
  streak: number;
  lastPlayed: string | null;
  bestMs: number | null;
  plays: number;
  snoozes: number;
  tierName: string | null;
  nextTier: { name: string; days: number } | null;
}

export interface RevealDiff {
  id: string;
  op: OpKind;
  cx: number;
  cy: number;
  bbox: Rect;
  label: string;
}

export interface ResultView {
  timeMs: number;
  splits: number[];
  pings: number;
  misses: number;
  found: number;
  total: number;
  scorable: boolean;
  rank: number | null;
  solvers: number;
  beatPct: number | null;
  parMs: number;
  medianMs: number | null;
  perfectPct: number | null;
  leaderboard: LeaderRow[];
  diffs: RevealDiff[];
  share: string;
  streak: number;
  flair: string | null;
}

export type PlayMode = 'scored' | 'practice' | 'done';

export interface PingZone {
  x: number;
  y: number;
  r: number;
}

export interface InitResponse {
  ok: true;
  date: string;
  dayNumber: number;
  theme: ThemeId;
  themeName: string;
  scene: PublicScene;
  total: number;
  parMs: number;
  mode: PlayMode;
  result: ResultView | null;
  streak: StreakView;
  leaderboard: LeaderboardView;
  startedAt: number | null;
  found: string[];
  /** Bboxes of differences already found this run (never unfound answers). */
  foundDiffs: RevealDiff[];
  splits: number[];
  pings: number;
  misses: number;
  postId: string | null;
  hintUsed: boolean;
  flair: string | null;
  /** Post-solve cosmetic only; never part of the puzzle. */
  snoovatar: string | null;
}

export interface TapResponse {
  ok: boolean;
  hit: boolean;
  found: number;
  total: number;
  bbox?: Rect;
  diffId?: string;
  startedAt?: number;
  missCount: number;
  pings: number;
  elapsedMs: number;
  done: boolean;
  result?: ResultView;
  reason?: 'too-fast' | 'already-done' | 'miss';
}

export interface PingResponse {
  ok: boolean;
  zone?: PingZone;
  pings: number;
  pingsLeft: number;
  elapsedMs: number;
  reason?: 'no-pings' | 'already-done' | 'too-fast';
}

export interface ApiError {
  ok: false;
  error: string;
}

/** Canonical weekday plan: Mon 5 obvious -> Fri 5 subtle -> Sat 6 -> Sun 7. */
export interface DayPlan {
  label: string;
  count: number;
  ops: OpKind[];
  weights: Record<OpKind, number>;
  subtle: boolean;
}
