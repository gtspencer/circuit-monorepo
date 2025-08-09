import type { DB, Cache } from '../types.js';
import { createSettingsService, type SettingsService } from './settingsService.js';

export function createServices(deps: { db: DB; cache: Cache }) {
  const settingsService = createSettingsService(deps.db, deps.cache);
  return { settingsService };
}

export type Services = ReturnType<typeof createServices>;
export type { SettingsService };