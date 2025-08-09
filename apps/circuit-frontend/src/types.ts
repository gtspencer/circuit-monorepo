import type { BaseMsg, Handler as SharedHandler, RouteEntry as SharedRouteEntry } from '@circuit/protocol';

export type Ctx = {
};

export type Handler<T extends BaseMsg = BaseMsg> =
  SharedHandler<T, Ctx, WebSocket>;

export type RouteEntry<T extends BaseMsg = BaseMsg> =
  SharedRouteEntry<T, Ctx, WebSocket>;