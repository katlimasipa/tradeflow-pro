import type { Trade } from "./types";

export interface Stats {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  pnl: number;
  pnlPct: number;
  totalRisk: number;
}

export function computeStats(trades: Trade[]): Stats {
  const wins = trades.filter((t) => t.result === "Win").length;
  const losses = trades.filter((t) => t.result === "Loss").length;
  const total = trades.length;
  const pnl = trades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const pnlPct = trades.reduce((s, t) => s + (Number(t.pnlPct) || 0), 0);
  const totalRisk = trades.reduce((s, t) => s + (Number(t.riskPct) || 0), 0);
  return {
    total,
    wins,
    losses,
    winRate: total ? (wins / total) * 100 : 0,
    pnl,
    pnlPct,
    totalRisk,
  };
}

export type Range = "weekly" | "monthly" | "yearly" | "overall";

export function filterByRange(trades: Trade[], range: Range, ref = new Date()): Trade[] {
  const r = new Date(ref);
  return trades.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    if (range === "weekly") {
      const start = new Date(r);
      const day = (start.getDay() + 6) % 7; // Mon = 0
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return d >= start && d < end;
    }
    if (range === "monthly") {
      return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth();
    }
    if (range === "yearly") {
      return d.getFullYear() === r.getFullYear();
    }
    return true; // overall
  });
}

export function cumulativePctSeriesForMonth(trades: Trade[], ref: Date) {
  const monthly = filterByRange(trades, "monthly", ref).slice().sort((a, b) => a.date.localeCompare(b.date));
  // Group by day, sum pnlPct per day, then accumulate
  const byDay = new Map<string, number>();
  for (const t of monthly) {
    byDay.set(t.date, (byDay.get(t.date) ?? 0) + (Number(t.pnlPct) || 0));
  }
  const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const series: { day: number; date: string; value: number; delta: number }[] = [];
  let running = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const delta = byDay.get(dateStr) ?? 0;
    running += delta;
    series.push({ day: i, date: dateStr, value: running, delta });
  }
  return series;
}

export function tradesByDay(trades: Trade[]) {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const arr = map.get(t.date) ?? [];
    arr.push(t);
    map.set(t.date, arr);
  }
  return map;
}

export function formatMoney(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
