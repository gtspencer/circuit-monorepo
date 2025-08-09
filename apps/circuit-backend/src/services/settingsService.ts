import type { UserSettings } from '@circuit/protocol';
import type { DB, Cache, SettingsDoc } from '../types.js';
import {
    DEFAULT_USER_SETTINGS,
} from '../utils/constants.js';

export function createSettingsService(db: DB, cache: Cache) {
    async function cacheGet(fid: number) {
        return cache.get<SettingsDoc>(cache.key.userSettings(fid));
    }

    async function cacheSet(fid: number, doc: SettingsDoc) {
        await cache.set(cache.key.userSettings(fid), doc);
    }

    async function loadFromDb(fid: number): Promise<SettingsDoc | null> {
        return await db.getCurrentSettings(fid);
    }

    async function saveToDb(fid: number, doc: SettingsDoc): Promise<void> {
        await db.upsertCurrentSettings(fid, doc);
    }

    return {
        // redis -> db -> redis
        async get(fid: number): Promise<UserSettings | null> {
            const cached = await cacheGet(fid);
            if (cached) return cached.settings;

            const fromDb = await loadFromDb(fid);
            if (fromDb) {
                await cacheSet(fid, fromDb);
                return fromDb.settings
            }

            // create new
            const next: SettingsDoc = {
                version: 1,
                updatedAt: Date.now(),
                settings: DEFAULT_USER_SETTINGS,
            };

            await saveToDb(fid, next);
            await cacheSet(fid, next);

            return next.settings;
        },

        // update settings and bump version
        async update(fid: number, patch: Partial<UserSettings>) {
            const base = (await cacheGet(fid)) ?? (await loadFromDb(fid)) ?? {
                version: 0,
                updatedAt: 0,
                settings: DEFAULT_USER_SETTINGS,
            };

            const next: SettingsDoc = {
                version: base.version + 1,
                updatedAt: Date.now(),
                settings: { ...base.settings, ...patch },
            };

            await saveToDb(fid, next);
            await cacheSet(fid, next);
            return next.settings;
        },

        // deletes setting
        async invalidate(fid: number) {
            await cache.del(cache.key.userSettings(fid));
        },
    };
}

export type SettingsService = ReturnType<typeof createSettingsService>;
