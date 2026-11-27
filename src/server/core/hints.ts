import { keys } from './keys';
import { loadRun } from './game';
import { isLockAcquired, type Store } from './store';
import { nextUnfound } from './taps';
import { quadrantHint } from '../../shared/share';
import { THEMES } from '../../shared/themes';
import type { Scene } from '../../shared/types';

export interface HintResult {
  replied: boolean;
  alreadyUsed: boolean;
  text: string | null;
}

/**
 * `!hint` handler. One per user per day, spoiler-wrapped, never touches score.
 * The hint points at the player's next unfound difference (or the anchor if
 * they have not started), and only names a quadrant.
 */
export async function handleHint(
  store: Store,
  scene: Scene,
  date: string,
  username: string,
): Promise<HintResult> {
  const claimed = await store.set(keys.hint(date, username), '1', {
    nx: true,
    ttlSeconds: 2 * 24 * 60 * 60,
  });

  if (!isLockAcquired(claimed)) {
    return { replied: false, alreadyUsed: true, text: null };
  }

  const run = await loadRun(store, date, username);
  const target = nextUnfound(scene, run.found) ?? scene.diffs[0];
  if (!target) return { replied: false, alreadyUsed: false, text: null };

  const theme = THEMES[scene.theme];
  const spoiler = quadrantHint({ cx: target.cx, cy: target.cy, theme });
  const text = [
    `${spoiler}`,
    '',
    "That's your one hint for today — it doesn't change your score. Wrap any help you give other players in spoiler tags too.",
  ].join('\n');

  return { replied: true, alreadyUsed: false, text };
}
