import { ServerMsg } from '@circuit/protocol';
import type { ServerMsgT } from '@circuit/protocol';
import type { Ctx, Handler, RouteEntry } from './types.js';
import type { WebSocket } from 'ws';
import { log } from './utils/logger.js';

const registry = new Map<ServerMsgT['type'], Handler<any>>();

export function registerRoutes(entries: RouteEntry<any>[]) {
  for (const [type, handler] of entries) {
    if (registry.has(type)) {
      throw new Error(`Duplicate route type registered: ${type}`);
    }
    log(`Registering ${type}`)
    registry.set(type, handler);
  }
}

// should probs use this for safety, but testing is easier with raw send
export function sendTyped(ws: WebSocket, obj: ServerMsgT) {
  const check = ServerMsg.safeParse(obj);
  if (!check.success) {
    // fallback if our server constructed a bad payload
    ws.send(JSON.stringify({ type: 'error', error: check.error.message }));
    return;
  }
  ws.send(JSON.stringify(check.data));
}

function send(ws: WebSocket, obj: unknown) {
  ws.send(JSON.stringify(obj));
}

// don't await this anywhere, async is just for tests
export async function route(ws: WebSocket, raw: string, ctx: Ctx) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return send(ws, { type: 'json-parse-error', error: 'invalid_json' });
  }

  const result = ServerMsg.safeParse(parsed);
  if (!result.success) {
    return send(ws, { type: 'message-parse-error', error: result.error.message });
  }

  const msg = result.data;
  
  const handler = registry.get(msg.type);
  if (!handler) {
    return send(ws, { type: 'missing-handler-error', error: `Unknown type: ${msg.type}` });
  }

  try {
    return handler(ws, msg as any, ctx);
  } catch (err: any) {
    return send(ws, { type: 'handler-error', error: err?.message ?? 'handler_error' });
  }
}

// for testing purposes ONLY.  if you use this in prod i will kill you
export function resetRoutes() {
  registry.clear();
}