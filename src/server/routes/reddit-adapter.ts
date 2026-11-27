import { reddit } from '@devvit/web/server';
import type { RedditLike } from '../core/publish';

/**
 * The publish pipeline and tests want a plain-string interface. Every branded
 * Reddit ID cast is confined to this adapter.
 */
export const redditLike: RedditLike = {
  async submitCustomPost(opts) {
    const post = await reddit.submitCustomPost(
      opts as unknown as Parameters<typeof reddit.submitCustomPost>[0],
    );
    return { id: post.id, permalink: post.permalink };
  },
  async submitComment(opts) {
    const comment = await reddit.submitComment(
      opts as unknown as Parameters<typeof reddit.submitComment>[0],
    );
    return { id: comment.id, permalink: comment.permalink };
  },
  async setPostFlair(opts) {
    await reddit.setPostFlair(opts as unknown as Parameters<typeof reddit.setPostFlair>[0]);
  },
  async setUserFlair(opts) {
    await reddit.setUserFlair(opts as unknown as Parameters<typeof reddit.setUserFlair>[0]);
  },
  async getPostById(id) {
    const post = await reddit.getPostById(
      id as unknown as Parameters<typeof reddit.getPostById>[0],
    );
    return { id: post.id, removed: post.removed, spam: post.spam };
  },
};
