import type { createClient } from 'redis';

export type RedisClient = ReturnType<typeof createClient>;

export function createRedisRequests(redis: RedisClient) {
  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    },

    async set<T>(key: string, value: T): Promise<void> {
      const payload = JSON.stringify(value);
      await redis.set(key, payload);
    },

    async del(key: string): Promise<void> {
      await redis.del(key);
    },

    /** key helpers (namespacing keeps things tidy) */
    key: {
      userSettings(fid: number | string) {
        return `user:settings:${fid}`;
      },
      // userStats(fid) { return `user:stats:${fid}`; }
    },
  };
}
