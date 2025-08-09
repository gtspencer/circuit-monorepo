import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseWebSocketOptions, WsStatus, InboundMessage, Listener, OutboundMessage } from '../lib/ws/messageTypes.js';

/**
 * Lightweight WebSocket hook with:
 * - auto reconnect (exponential backoff)
 * - heartbeat ping
 * - message routing by `type`
 * - queued sends while connecting
 */
export function useWebSocket(options: UseWebSocketOptions) {
    const {
        url,
        token,
        protocols,
        autoReconnect = true,
        maxBackoffMs = 10_000,
        heartbeatMs = 15_000,
    } = options;

    const wsRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<WsStatus>("idle");
    const [ready, setReady] = useState(false);

    const backoffRef = useRef(250);
    const hbTimerRef = useRef<number | null>(null);
    const sendQueueRef = useRef<string[]>([]);
    const listenersRef = useRef<Map<string, Set<Listener>>>(new Map());

    const on = useCallback(<T extends InboundMessage = InboundMessage>(
        type: T["type"],
        fn: Listener<T>
    ) => {
        if (!listenersRef.current.has(type)) listenersRef.current.set(type, new Set());
        // @ts-expect-error generic set is fine at runtime; enforce at callsite
        listenersRef.current.get(type)!.add(fn);
        return () => {
            // @ts-expect-error same as above
            listenersRef.current.get(type)?.delete(fn);
        };
    }, []);

    const dispatch = (msg: InboundMessage) => {
        const set = listenersRef.current.get(msg?.type);
        if (!set) return;
        for (const fn of set) fn(msg);
    };

    const flushQueue = () => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        while (sendQueueRef.current.length) ws.send(sendQueueRef.current.shift()!);
    };

    const send = useCallback((msg: OutboundMessage) => {
        const s = JSON.stringify(msg);
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(s);
        else sendQueueRef.current.push(s);
    }, []);

    const connect = useCallback(() => {
        // avoid duplicate connects
        const existing = wsRef.current;
        if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) return;

        setStatus("connecting");
        const u = new URL(url);
        if (token) u.searchParams.set("token", token);

        const ws = new WebSocket(u.toString(), protocols);
        wsRef.current = ws;

        ws.onopen = () => {
            setReady(true);
            setStatus("open");
            backoffRef.current = 250;
            flushQueue();

            // heartbeat
            if (hbTimerRef.current) window.clearInterval(hbTimerRef.current);
            hbTimerRef.current = window.setInterval(() => {
                try {
                    ws.send(JSON.stringify({ type: "ping", t: Date.now() }));
                } catch {
                    // ignore
                }
            }, heartbeatMs) as unknown as number;
        };

        ws.onmessage = (ev) => {
            try {
                const parsed = JSON.parse(ev.data) as InboundMessage;
                dispatch(parsed);
            } catch {
                // ignore bad json
            }
        };

        ws.onerror = () => {
            // ensure close -> reconnect path
            try { ws.close(); } catch { }
        };

        ws.onclose = () => {
            setReady(false);
            setStatus("closed");
            if (hbTimerRef.current) { window.clearInterval(hbTimerRef.current); hbTimerRef.current = null; }

            if (autoReconnect) {
                const delay = Math.min(backoffRef.current, maxBackoffMs);
                backoffRef.current = Math.min(backoffRef.current * 2, maxBackoffMs);
                window.setTimeout(connect, delay);
            }
        };
    }, [url, token, protocols, autoReconnect, maxBackoffMs, heartbeatMs]);

    useEffect(() => {
        connect();
        return () => {
            // reset and cleanup
            backoffRef.current = 250;
            if (hbTimerRef.current) window.clearInterval(hbTimerRef.current);
            try { wsRef.current?.close(); } catch { }
            wsRef.current = null;
        };
    }, [connect]);

    // Reconnect when tab becomes visible (helps after sleep/wake)
    useEffect(() => {
        const onVis = () => {
            if (document.visibilityState !== "visible") return;
            const ws = wsRef.current;
            if (!ws || ws.readyState !== WebSocket.OPEN) connect();
        };
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, [connect]);

    // Manual controls if needed by caller
    const close = useCallback(() => {
        autoReconnect && (backoffRef.current = 250);
        try { wsRef.current?.close(); } catch { }
    }, [autoReconnect]);

    const reconnectNow = useCallback(() => {
        close();
        connect();
    }, [close, connect]);

    return useMemo(
        () => ({
            /** true when socket is OPEN */
            ready,
            status,
            /** send({ type: 'echo', data: 'hi' }) */
            send,
            /** on('broadcast', (msg)=>...) -> returns unsubscribe */
            on,
            /** get raw socket if you must */
            socket: () => wsRef.current,
            /** force reconnect immediately */
            reconnectNow,
            /** close and stop */
            close,
        }),
        [ready, status, send, on, reconnectNow, close]
    );
}