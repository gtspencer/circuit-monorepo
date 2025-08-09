import { createContext, useContext, type ReactNode } from "react";
import { useWebSocket } from "../hooks/useWebSocket.js";

type WS = ReturnType<typeof useWebSocket>;
const WSContext = createContext<WS | null>(null);

export function WSProvider({ children }: { children: ReactNode }) {
  const ws = useWebSocket({
    url: import.meta.env.VITE_WS_URL ?? "ws://localhost:3001/ws",
    token: localStorage.getItem("authToken") ?? undefined,
  });
  return <WSContext.Provider value={ws}>{children}</WSContext.Provider>;
}

export function useWS() {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error("useWS must be used within <WSProvider>");
  return ctx;
}
