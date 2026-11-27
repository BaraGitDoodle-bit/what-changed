/**
 * Redis schema, exactly as specified in CONCEPT.md §5, plus two documented
 * additions: `wc:postdate:{postId}` (post -> day mapping so a week-old post
 * still opens its own board) and the run hash's `lastFindAt` field (250ms
 * anti-spam window).
 */
export const keys = {
  scene: (date: string) => `wc:scene:${date}`,
  meta: (date: string) => `wc:meta:${date}`,
  run: (date: string, user: string) => `wc:run:${date}:${user}`,
  leaderboard: (date: string) => `wc:lb:${date}`,
  leaderboardAux: (date: string) => `wc:lb:${date}:aux`,
  user: (user: string) => `wc:user:${user}`,
  stats: (date: string) => `wc:stats:${date}`,
  posted: (date: string) => `wc:posted:${date}`,
  recap: (date: string) => `wc:recap:${date}`,
  done: (date: string, user: string) => `wc:done:${date}:${user}`,
  hint: (date: string, user: string) => `wc:hint:${date}:${user}`,
  started: (date: string, user: string) => `wc:started:${date}:${user}`,
  share: (date: string, user: string) => `wc:share:${date}:${user}`,
  day: 'wc:day',
  postDate: (postId: string) => `wc:postdate:${postId}`,
  genLock: (date: string) => `wc:genlock:${date}`,
  publishLock: (date: string) => `wc:publishlock:${date}`,
} as const;

export const SCENE_TTL_SECONDS = 21 * 24 * 60 * 60;
