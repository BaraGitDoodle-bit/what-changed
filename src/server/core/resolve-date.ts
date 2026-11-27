import { isDateKey, todayKey } from '../../shared/date';
import { keys } from './keys';
import type { Store } from './store';

/**
 * Which puzzle does this request belong to?
 * 1. explicit postId -> the stored post/date mapping (a week-old post keeps
 *    playing its own board),
 * 2. postData.date when the post carries it,
 * 3. today (UTC).
 */
export async function resolveDateForRequest(input: {
  store: Store;
  postId: string | null;
  postDataDate?: unknown;
  now?: Date;
}): Promise<string> {
  const { store, postId, postDataDate, now = new Date() } = input;
  if (postId) {
    const mapped = await store.get(keys.postDate(postId));
    if (isDateKey(mapped)) return mapped;
  }
  if (isDateKey(postDataDate)) return postDataDate;
  return todayKey(now);
}
