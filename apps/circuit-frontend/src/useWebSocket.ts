// src/hooks/useWebSocket.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export type BaseMsg = { type: string } & Record<string, Json>;

type WsState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "open" }
  | { status: "closed"; reason?: string };

type Options<LoginMsg extends BaseMsg> = {
  url?: string;                  // default: env var
  makeLogin?: () => LoginMsg;    // send once "open"
  protocols?: string | string[];
  heartbeatMs?: number;          // default: 20_000
  maxBackoffMs?: number;         // default: 10_000
  debug?: boolean;
};

export function useWebSocket<LoginMsg extends BaseMsg = BaseMsg>(
  {
    url = (import.meta as any).env?.VITE_WS_URL ?? process.env.WS_URL,
    makeLogin,
    protocols,
    heartbeatMs = 20_000,
    maxBackoffMs = 10_000,
    debug = false,
  }: Options<LoginMsg> = {}
) {
  const [state, setState] = useState<WsState>({ status: "idle" });
  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(0);
  const hbTimer = useRef<number | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const sendQueue = useRef<string[]>([]);
  const isVisible = useRef<boolean>(true);

  const log = (...a: any[]) => debug && console.log("[ws]", ...a);

  const cleanup = useCallback(() => {
    if (hbTimer.current) window.clearInterval(hbTimer.current);
    if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
    hbTimer.current = null;
    reconnectTimer.current = null;
    if (wsRef.current) {
      wsRef.current.onopen = null as any;
      wsRef.current.onclose = null as any;
      wsRef.current.onerror = null as any;
      wsRef.current.onmessage = null as any;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback((reason?: string) => {
    if (!url) return;
    const base = 250;
    backoffRef.current = Math.min(
      maxBackoffMs,
      backoffRef.current ? Math.round(backoffRef.current * 1.8) : base
    );
    const delay = backoffRef.current + Math.floor(Math.random() * 200);
    log("reconnect in", delay, "ms", reason ?? "");
    reconnectTimer.current = window.setTimeout(() => connect(), delay);
  }, [maxBackoffMs, url]);

  const startHeartbeat = useCallback(() => {
    if (hbTimer.current) window.clearInterval(hbTimer.current);
    hbTimer.current = window.setInterval(() => {
      const w = wsRef.current;
      if (!w || w.readyState !== WebSocket.OPEN) return;
      try { w.send(JSON.stringify({ type: "ping" })); } catch {}
    }, heartbeatMs) as unknown as number;
  }, [heartbeatMs]);

  const flushQueue = useCallback(() => {
    const w = wsRef.current;
    if (!w || w.readyState !== WebSocket.OPEN) return;
    for (const data of sendQueue.current) w.send(data);
    sendQueue.current = [];
  }, []);

  const connect = useCallback(() => {
    if (!url) {
      setState({ status: "closed", reason: "No WebSocket URL" });
      return;
    }
    cleanup();
    setState({ status: "connecting" });
    log("connecting to", url);
    const w = new WebSocket(url, protocols);
    wsRef.current = w;

    w.onopen = () => {
      log("open");
      setState({ status: "open" });
      backoffRef.current = 0;
      startHeartbeat();
      if (makeLogin) {
        try { w.send(JSON.stringify(makeLogin())); } catch {}
      }
      flushQueue();
    };

    w.onmessage = (ev) => {
      // no-op here; consumer can add their own onMessage via returned ws
      // (or just attach event listener on wsRef.current in an effect)
      log("message", ev.data);
    };

    w.onerror = () => {
      log("error");
    };

    w.onclose = (ev) => {
      log("closed", ev.code, ev.reason);
      setState({ status: "closed", reason: ev.reason || String(ev.code) });
      cleanup();
      if (isVisible.current) scheduleReconnect(ev.reason);
    };
  }, [cleanup, flushQueue, makeLogin, protocols, scheduleReconnect, startHeartbeat, url]);

  // Public send: queue until OPEN
  const send = useCallback((msg: BaseMsg) => {
    const data = JSON.stringify(msg);
    const w = wsRef.current;
    if (w && w.readyState === WebSocket.OPEN) {
      w.send(data);
    } else {
      sendQueue.current.push(data);
    }
  }, []);

  // visibility pause (avoid burning battery in background tabs)
  useEffect(() => {
    const onVis = () => {
      isVisible.current = document.visibilityState === "visible";
      if (isVisible.current && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
        scheduleReconnect("tab visible");
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [scheduleReconnect]);

  // connect on mount, cleanup on unmount
  useEffect(() => {
    connect();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // re-connect if URL changes

  return useMemo(() => ({
    state,
    ws: wsRef.current as WebSocket | null,
    send,
    reconnect: connect,
  }), [connect, send, state]);
}
