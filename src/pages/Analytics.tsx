import { useMemo, useState } from "react";
import { useTrades } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { RangeTabs } from "@/components/RangeTabs";
import { computeStats, filterByRange, formatMoney, formatPct, type Range } from "@/lib/analytics";
import { StatCard } from "@/components/StatCard";
import { MonthlyChart } from "@/components/MonthlyChart";

export default function Analytics() {
  const { trades } = useTrades();
  const [range, setRange] = useState<Range>("monthly");
  const refDate = new Date();
  const ranged = useMemo(() => filterByRange(trades, range, refDate), [trades, range]);
  const stats = useMemo(() => computeStats(ranged), [ranged]);

  // Pair breakdown
  const pairs = useMemo(() => {
    const m = new Map<string, { count: number; pnl: number; wins: number }>();
    for (const t of ranged) {
      const cur = m.get(t.pair) ?? { count: 0, pnl: 0, wins: 0 };
      cur.count++;
      cur.pnl += t.pnl;
      if (t.result === "Win") cur.wins++;
      m.set(t.pair, cur);
    }
    return Array.from(m.entries())
      .map(([pair, v]) => ({ pair, ...v, winRate: (v.wins / v.count) * 100 }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
  }, [ranged]);

  return (
    <div>
      <PageHeader eyebrow="Performance" title="Analytics">
        <RangeTabs value={range} onChange={setRange} />
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Trades" value={stats.total.toString()} />
        <StatCard label="Win rate" value={`${stats.winRate.toFixed(1)}%`} />
        <StatCard label="PnL" value={formatMoney(stats.pnl)} tone={stats.pnl >= 0 ? "win" : "loss"} />
        <StatCard label="PnL %" value={formatPct(stats.pnlPct)} tone={stats.pnlPct >= 0 ? "win" : "loss"} />
      </div>

      {range === "monthly" ? (
        <div className="mt-8">
          <MonthlyChart trades={trades} refDate={refDate} />
        </div>
      ) : (
        <div className="mt-8 card-flat p-10 text-center">
          <div className="font-display text-xl mb-1">Cumulative chart</div>
          <div className="text-sm text-muted-foreground max-w-md mx-auto">
            The cumulative profit graph is available on the monthly view. Switch to <span className="font-medium text-foreground">Month</span> to see it.
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Breakdown</div>
            <h2 className="font-display text-2xl">By pair</h2>
          </div>
        </div>

        <div className="card-flat overflow-hidden">
          <div className="grid grid-cols-[1fr_60px_80px_100px] md:grid-cols-[1fr_80px_100px_120px_120px] gap-3 px-4 py-2.5 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-surface-sunk/50">
            <div>Pair</div>
            <div>Trades</div>
            <div className="hidden md:block">Wins</div>
            <div>Win rate</div>
            <div>PnL</div>
          </div>
          {pairs.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No data in this range.</div>
          ) : (
            pairs.map((p) => (
              <div key={p.pair} className="grid grid-cols-[1fr_60px_80px_100px] md:grid-cols-[1fr_80px_100px_120px_120px] gap-3 px-4 py-3 border-b last:border-b-0 items-center">
                <div className="font-medium tracking-tight">{p.pair}</div>
                <div className="num text-sm text-muted-foreground">{p.count}</div>
                <div className="hidden md:block num text-sm text-muted-foreground">{p.wins}</div>
                <div className="num text-sm">{p.winRate.toFixed(0)}%</div>
                <div className={`num text-sm font-medium ${p.pnl >= 0 ? "text-win" : "text-loss"}`}>{formatMoney(p.pnl)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
