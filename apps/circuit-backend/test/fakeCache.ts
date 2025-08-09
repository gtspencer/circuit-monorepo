import type { Cache } from '../src/types.js';

export function makeFakeCache(): Cache {
  const store = new Map<string, string>();

  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = store.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    },
    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
      // ignore ttl in tests
      store.set(key, JSON.stringify(value));
    },
    async del(key: string): Promise<void> {
      store.delete(key);
    },
    key: {
      userSettings(fid: number | string) {
        return `user:settings:${fid}`;
      },
    },
  };
}
