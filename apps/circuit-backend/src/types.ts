import type { WebSocketServer, WebSocket } from 'ws';
import type { createDatabaseRequests } from './utils/databaseRequests.js';
import type { createRedisRequests } from './utils/redisRequests.js';
import { UserSettings, BaseMsg, Handler as SharedHandler, RouteEntry as SharedRouteEntry } from '@circuit/protocol';

// types (vs schemas) are for internal plumbing, and have no trust boundary/interaction with public

export type DB = ReturnType<typeof createDatabaseRequests>;
export type Cache = ReturnType<typeof createRedisRequests>;

// shared server wide connection
export type Ctx = { wss: WebSocketServer; };

export type SettingsDoc = { version: number; updatedAt: number; settings: UserSettings };

export type Handler<T extends BaseMsg = BaseMsg> =
  SharedHandler<T, Ctx, WebSocket>;

export type RouteEntry<T extends BaseMsg = BaseMsg> =
  SharedRouteEntry<T, Ctx, WebSocket>;

export interface DatabaseRequests {
  getCurrentSettings(fid: number): Promise<SettingsDoc | null>;
  upsertCurrentSettings(fid: number, settings: SettingsDoc): Promise<null>;
}