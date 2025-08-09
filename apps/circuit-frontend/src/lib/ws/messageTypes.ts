export type WsStatus = "idle" | "connecting" | "open" | "closed";

/** Extend this or import a union from lib/ws/messageTypes */
export type InboundMessage = { type: string; [k: string]: unknown };
export type OutboundMessage = Record<string, unknown>;

export type Listener<T extends InboundMessage = InboundMessage> = (msg: T) => void;

export interface UseWebSocketOptions {
  /** e.g. wss://api.example.com/ws */
  url: string;
  /** optional auth (query param). Prefer JWT or use Sec-WebSocket-Protocol if you control server */
  token?: string;
  protocols?: string | string[];
  autoReconnect?: boolean;      // default: true
  maxBackoffMs?: number;        // default: 10_000
  heartbeatMs?: number;         // default: 15_000
}