import { registerRoutes, resetRoutes } from '../src/router.js';
import { userLoginRoute, userGetSettingsRoute, userSetSettingsRoute } from '../src/routes/userRoutes.js';
import { createServices } from '../src/services/index.js';
import { makeFakeCache } from './fakeCache.js';
import { makeFakeDb } from './fakeDb.js';
import { vi } from 'vitest';

export class FakeWS {
  out: string[] = [];
  send = vi.fn((s: string) => { this.out.push(s); });
}

export const printLastMsg = (ws: FakeWS) => console.log(ws.out.at(-1)!)
export const lastMsg = (ws: FakeWS) => JSON.parse(ws.out.at(-1)!);

export function setupTestRouter() {
  resetRoutes();
  const db = makeFakeDb();
  const cache = makeFakeCache();

  const services = createServices({ db, cache });

  registerRoutes([
    ...userLoginRoute(),
    ...userGetSettingsRoute({ settingsService: services.settingsService }),
    ...userSetSettingsRoute({ settingsService: services.settingsService }),
  ]);

  const ctx = {} as any; // your routes don’t need wss/db/redis in tests
  return { ctx, cache, db };
}
