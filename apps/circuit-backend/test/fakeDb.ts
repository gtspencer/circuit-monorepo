import type { DB, SettingsDoc } from '../src/types.js';

export function makeFakeDb(): DB {
    return {
        async getCurrentSettings(fid) {
            return null;
        },
        async upsertCurrentSettings(fid: number, settings: SettingsDoc) {
            return null;
        },
    };
}
