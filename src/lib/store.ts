import { useEffect, useState, useCallback } from "react";
import type { Trade } from "./types";

const KEY = "trading-journal:v1";

type Listener = (trades: Trade[]) => void;
const listeners = new Set<Listener>();

function read(): Trade[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Trade[];
  } catch {
    return [];
  }
}

function write(trades: Trade[]) {
  localStorage.setItem(KEY, JSON.stringify(trades));
  listeners.forEach((l) => l(trades));
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(() => read());

  useEffect(() => {
    const l: Listener = (t) => setTrades(t);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const addTrade = useCallback((t: Omit<Trade, "id" | "createdAt">) => {
    const next: Trade = { ...t, id: crypto.randomUUID(), createdAt: Date.now() };
    write([next, ...read()]);
  }, []);

  const updateTrade = useCallback((id: string, patch: Partial<Trade>) => {
    write(read().map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const deleteTrade = useCallback((id: string) => {
    write(read().filter((x) => x.id !== id));
  }, []);

  return { trades, addTrade, updateTrade, deleteTrade };
}
