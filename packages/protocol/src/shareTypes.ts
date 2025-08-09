export type AnyJson =
  | null
  | boolean
  | number
  | string
  | AnyJson[]
  | { [k: string]: AnyJson };

export type BaseMsg = { type: string } & Record<string, AnyJson>;

export type Handler<
  T extends BaseMsg = BaseMsg,
  C = unknown,
  WS = unknown
> = (ws: WS, msg: T, ctx: C) => void | Promise<void>;

export type RouteEntry<
  T extends BaseMsg = BaseMsg,
  C = unknown,
  WS = unknown
> = [T['type'], Handler<T, C, WS>];