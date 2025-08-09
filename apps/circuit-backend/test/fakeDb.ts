import type { DB } from '../src/types.js';

export function makeFakeDb(): DB {
    return {
        async getCurrentSettings(fid) {
            return null;
        },
        async setCurrentSettings(fid) {
            return null;
        },
    };
}
