import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Trade, Timeframe, Result } from "./types";

type Row = {
  id: string;
  user_id: string;
  date: string;
  pair: string;
  timeframe: string;
  risk_pct: number | string;
  result: string;
  pnl: number | string;
  pnl_pct: number | string;
  screenshot_url: string | null;
  screenshot_link: string | null;
  created_at: string;
};

function rowToTrade(r: Row): Trade {
  return {
    id: r.id,
    date: r.date,
    pair: r.pair,
    timeframe: r.timeframe as Timeframe,
    riskPct: Number(r.risk_pct),
    result: r.result as Result,
    pnl: Number(r.pnl),
    pnlPct: Number(r.pnl_pct),
    screenshotUrl: r.screenshot_url,
    screenshotLink: r.screenshot_link,
    createdAt: new Date(r.created_at).getTime(),
  };
}

let cache: Trade[] = [];
let loaded = false;
const listeners = new Set<(t: Trade[]) => void>();
const emit = () => listeners.forEach((l) => l(cache));

async function fetchAll() {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  cache = (data as Row[]).map(rowToTrade);
  loaded = true;
  emit();
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(cache);

  useEffect(() => {
    const l = (t: Trade[]) => setTrades([...t]);
    listeners.add(l);
    if (!loaded) fetchAll();
    else setTrades([...cache]);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const addTrade = useCallback(async (t: Omit<Trade, "id" | "createdAt">) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("trades")
      .insert({
        user_id: u.user.id,
        date: t.date,
        pair: t.pair,
        timeframe: t.timeframe,
        risk_pct: t.riskPct,
        result: t.result,
        pnl: t.pnl,
        pnl_pct: t.pnlPct,
        screenshot_url: t.screenshotUrl ?? null,
        screenshot_link: t.screenshotLink ?? null,
      })
      .select()
      .single();
    if (error) {
      console.error(error);
      return;
    }
    cache = [rowToTrade(data as Row), ...cache];
    emit();
  }, []);

  const updateTrade = useCallback(async (id: string, patch: Partial<Trade>) => {
    const dbPatch: Record<string, string | number | null> = {};
    if (patch.date !== undefined) dbPatch.date = patch.date;
    if (patch.pair !== undefined) dbPatch.pair = patch.pair;
    if (patch.timeframe !== undefined) dbPatch.timeframe = patch.timeframe;
    if (patch.riskPct !== undefined) dbPatch.risk_pct = patch.riskPct;
    if (patch.result !== undefined) dbPatch.result = patch.result;
    if (patch.pnl !== undefined) dbPatch.pnl = patch.pnl;
    if (patch.pnlPct !== undefined) dbPatch.pnl_pct = patch.pnlPct;
    if (patch.screenshotUrl !== undefined) dbPatch.screenshot_url = patch.screenshotUrl;
    if (patch.screenshotLink !== undefined) dbPatch.screenshot_link = patch.screenshotLink;

    const { data, error } = await supabase.from("trades").update(dbPatch).eq("id", id).select().single();
    if (error) {
      console.error(error);
      return;
    }
    cache = cache.map((x) => (x.id === id ? rowToTrade(data as Row) : x));
    emit();
  }, []);

  const deleteTrade = useCallback(async (id: string) => {
    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    cache = cache.filter((x) => x.id !== id);
    emit();
  }, []);

  return { trades, addTrade, updateTrade, deleteTrade };
}

export function resetTradesCache() {
  cache = [];
  loaded = false;
  emit();
}

export async function uploadScreenshot(file: File): Promise<string | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const ext = file.name.split(".").pop() || "png";
  const path = `${u.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("trade-screenshots").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error(error);
    return null;
  }
  const { data } = supabase.storage.from("trade-screenshots").getPublicUrl(path);
  return data.publicUrl;
}
