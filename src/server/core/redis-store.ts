import type { RedisClient } from '@devvit/redis';
import type { Store } from './store';

/** Adapter from the Devvit Redis client to the narrow Store interface. */
export function createRedisStore(redis: RedisClient): Store {
  return {
    get: (key) => redis.get(key),
    async set(key, value, opts) {
      const options: { nx?: boolean; expiration?: Date } = {};
      if (opts?.nx) options.nx = true;
      if (opts?.ttlSeconds) options.expiration = new Date(Date.now() + opts.ttlSeconds * 1000);
      const result = await redis.set(key, value, options);
      return result ?? null;
    },
    async del(...keys) {
      await redis.del(...keys);
    },
    exists: (...keys) => redis.exists(...keys),
    async expire(key, seconds) {
      await redis.expire(key, seconds);
    },
    incrBy: (key, amount) => redis.incrBy(key, amount),
    hGet: (key, field) => redis.hGet(key, field),
    hGetAll: (key) => redis.hGetAll(key),
    hSet: (key, values) => redis.hSet(key, values),
    hDel: (key, fields) => redis.hDel(key, fields),
    hIncrBy: (key, field, amount) => redis.hIncrBy(key, field, amount),
    zAdd: (key, member, score) => redis.zAdd(key, { member, score }),
    zRange: (key, start, stop) => redis.zRange(key, start, stop, { by: 'rank' }),
    zRank: (key, member) => redis.zRank(key, member),
    zCard: (key) => redis.zCard(key),
  };
}
