import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Timeframe, Result } from "./types";

export interface BacktestSession {
  id: string;
  name: string;
  pair: string;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: number;
}

export interface BacktestTrade {
  id: string;
  sessionId: string;
  date: string;
  pair: string;
  timeframe: Timeframe;
  riskPct: number;
  result: Result;
  pnl: number;
  pnlPct: number;
  createdAt: number;
}

type SRow = {
  id: string; user_id: string; name: string; pair: string;
  start_date: string | null; end_date: string | null;
  notes: string | null; created_at: string;
};

type TRow = {
  id: string; session_id: string; user_id: string; date: string;
  pair: string; timeframe: string; risk_pct: number | string;
  result: string; pnl: number | string; pnl_pct: number | string;
  created_at: string;
};

function rowToSession(r: SRow): BacktestSession {
  return {
    id: r.id, name: r.name, pair: r.pair,
    startDate: r.start_date, endDate: r.end_date,
    notes: r.notes, createdAt: new Date(r.created_at).getTime(),
  };
}
function rowToTrade(r: TRow): BacktestTrade {
  return {
    id: r.id, sessionId: r.session_id, date: r.date, pair: r.pair,
    timeframe: r.timeframe as Timeframe,
    riskPct: Number(r.risk_pct), result: r.result as Result,
    pnl: Number(r.pnl), pnlPct: Number(r.pnl_pct),
    createdAt: new Date(r.created_at).getTime(),
  };
}

let sCache: BacktestSession[] = [];
let sLoaded = false;
const sListeners = new Set<(s: BacktestSession[]) => void>();
const sEmit = () => sListeners.forEach((l) => l(sCache));

export function useBacktestSessions() {
  const [sessions, setSessions] = useState<BacktestSession[]>(sCache);

  useEffect(() => {
    const l = (s: BacktestSession[]) => setSessions([...s]);
    sListeners.add(l);
    if (!sLoaded) {
      (async () => {
        const { data, error } = await supabase
          .from("backtest_sessions")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          sCache = (data as SRow[]).map(rowToSession);
          sLoaded = true;
          sEmit();
        }
      })();
    } else setSessions([...sCache]);
    return () => { sListeners.delete(l); };
  }, []);

  const create = useCallback(async (input: Omit<BacktestSession, "id" | "createdAt">) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase.from("backtest_sessions").insert({
      user_id: u.user.id,
      name: input.name, pair: input.pair.toUpperCase(),
      start_date: input.startDate, end_date: input.endDate,
      notes: input.notes,
    }).select().single();
    if (error) { console.error(error); return null; }
    const s = rowToSession(data as SRow);
    sCache = [s, ...sCache];
    sEmit();
    return s;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<BacktestSession>) => {
    const dbPatch: Record<string, any> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.pair !== undefined) dbPatch.pair = patch.pair.toUpperCase();
    if (patch.startDate !== undefined) dbPatch.start_date = patch.startDate;
    if (patch.endDate !== undefined) dbPatch.end_date = patch.endDate;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    const { data, error } = await supabase.from("backtest_sessions").update(dbPatch).eq("id", id).select().single();
    if (error) { console.error(error); return; }
    sCache = sCache.map((x) => x.id === id ? rowToSession(data as SRow) : x);
    sEmit();
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("backtest_sessions").delete().eq("id", id);
    if (error) { console.error(error); return; }
    sCache = sCache.filter((x) => x.id !== id);
    sEmit();
  }, []);

  return { sessions, createSession: create, updateSession: update, deleteSession: remove };
}

export function useBacktestSession(id: string | undefined) {
  const { sessions } = useBacktestSessions();
  const session = sessions.find((s) => s.id === id) ?? null;
  const [trades, setTrades] = useState<BacktestTrade[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("backtest_trades")
      .select("*")
      .eq("session_id", id)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });
    setLoading(false);
    if (!error && data) setTrades((data as TRow[]).map(rowToTrade));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const addTrade = useCallback(async (t: Omit<BacktestTrade, "id" | "sessionId" | "createdAt">) => {
    if (!id) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase.from("backtest_trades").insert({
      session_id: id, user_id: u.user.id,
      date: t.date, pair: t.pair, timeframe: t.timeframe,
      risk_pct: t.riskPct, result: t.result, pnl: t.pnl, pnl_pct: t.pnlPct,
    }).select().single();
    if (error) { console.error(error); return; }
    setTrades((prev) => [...prev, rowToTrade(data as TRow)].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt));
  }, [id]);

  const updateTrade = useCallback(async (tid: string, patch: Partial<BacktestTrade>) => {
    const dbPatch: Record<string, any> = {};
    if (patch.date !== undefined) dbPatch.date = patch.date;
    if (patch.pair !== undefined) dbPatch.pair = patch.pair;
    if (patch.timeframe !== undefined) dbPatch.timeframe = patch.timeframe;
    if (patch.riskPct !== undefined) dbPatch.risk_pct = patch.riskPct;
    if (patch.result !== undefined) dbPatch.result = patch.result;
    if (patch.pnl !== undefined) dbPatch.pnl = patch.pnl;
    if (patch.pnlPct !== undefined) dbPatch.pnl_pct = patch.pnlPct;
    const { data, error } = await supabase.from("backtest_trades").update(dbPatch).eq("id", tid).select().single();
    if (error) { console.error(error); return; }
    setTrades((prev) => prev.map((x) => x.id === tid ? rowToTrade(data as TRow) : x));
  }, []);

  const deleteTrade = useCallback(async (tid: string) => {
    const { error } = await supabase.from("backtest_trades").delete().eq("id", tid);
    if (error) { console.error(error); return; }
    setTrades((prev) => prev.filter((x) => x.id !== tid));
  }, []);

  return { session, trades, loading, addTrade, updateTrade, deleteTrade, reload: load };
}

export function resetBacktestCache() {
  sCache = [];
  sLoaded = false;
  sEmit();
}
