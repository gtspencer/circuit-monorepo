import type { DatabaseRequests, SettingsDoc } from '../types.js';

export function createDatabaseRequests(/* pgPool: Pool */): DatabaseRequests {
  return {
    async getCurrentSettings(fid) {
      // return (await pgPool.query('select ... where fid=$1', [fid])).rows[0] ?? null;
      return null;
    },
    async upsertCurrentSettings(fid: number, settings: SettingsDoc) {
      return null;
    },
  };
}