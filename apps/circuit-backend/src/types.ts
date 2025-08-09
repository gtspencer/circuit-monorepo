import type { WebSocketServer, WebSocket } from 'ws';
import type { createDatabaseRequests } from './utils/databaseRequests.js';
import type { createRedisRequests } from './utils/redisRequests.js';
import { UserSettings } from '@circuit/protocol';

// types (vs schemas) are for internal plumbing, and have no trust boundary/interaction with public

export type DB = ReturnType<typeof createDatabaseRequests>;
export type Cache = ReturnType<typeof createRedisRequests>;

// shared server wide connection
export type Ctx = { wss: WebSocketServer; };

export type AnyJson =
  | null
  | boolean
  | number
  | string
  | AnyJson[]
  | { [k: string]: AnyJson };

export type BaseMsg = { type: string } & Record<string, AnyJson>;

export type Handler<T extends BaseMsg = BaseMsg> = (
  ws: WebSocket,
  msg: T,
  ctx: Ctx
) => void | Promise<void>;

export type RouteEntry<T extends BaseMsg = BaseMsg> = [T['type'], Handler<T>];

export type SettingsDoc = { version: number; updatedAt: number; settings: UserSettings };

export interface DatabaseRequests {
  getCurrentSettings(fid: number): Promise<SettingsDoc | null>;
  upsertCurrentSettings(fid: number, settings: SettingsDoc): Promise<null>;
}