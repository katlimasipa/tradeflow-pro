import { useMemo, useState } from "react";
import { useTrades } from "@/lib/store";
import { computeStats, filterByRange, formatMoney, formatPct, type Range } from "@/lib/analytics";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { RangeTabs } from "@/components/RangeTabs";
import { MonthlyChart } from "@/components/MonthlyChart";
import { TradeRow } from "@/components/TradeRow";
import { DateNavigation } from "@/components/DateNavigation";

export default function Dashboard() {
  const { trades } = useTrades();
  const [range, setRange] = useState<Range>("monthly");
  const [refDate, setRefDate] = useState(new Date());
  const ranged = useMemo(() => filterByRange(trades, range, refDate), [trades, range, refDate]);
  const stats = useMemo(() => computeStats(ranged), [ranged]);
  const recent = useMemo(() => trades.slice(0, 5), [trades]);

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Dashboard">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <DateNavigation range={range} refDate={refDate} onChange={setRefDate} />
          <RangeTabs value={range} onChange={(v) => { setRange(v); setRefDate(new Date()); }} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard label="Total trades" value={stats.total.toString()} hint={`${ranged.length} in view`} />
        <StatCard label="Wins" value={stats.wins.toString()} tone="win" />
        <StatCard label="Losses" value={stats.losses.toString()} tone="loss" />
        <StatCard label="Break-evens" value={stats.breakEvens.toString()} />
        <StatCard label="Win rate" value={`${stats.winRate.toFixed(1)}%`} />
        <StatCard label="Total PnL" value={formatMoney(stats.pnl)} tone={stats.pnl >= 0 ? "win" : "loss"} />
        <StatCard label="Total PnL %" value={formatPct(stats.pnlPct)} tone={stats.pnlPct >= 0 ? "win" : "loss"} />
        <StatCard label="Total risk" value={`${stats.totalRisk.toFixed(2)}%`} />
        <StatCard label="Avg / trade" value={stats.total ? formatMoney(stats.pnl / stats.total) : "—"} />
      </div>

      <div className="mt-8">
        <MonthlyChart trades={trades} refDate={refDate} />
      </div>

      <div className="mt-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Recent</div>
            <h2 className="font-display text-2xl">Latest trades</h2>
          </div>
        </div>
        <div className="card-flat overflow-hidden">
          {recent.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No trades yet. Hit <span className="font-medium text-foreground">New trade</span> to start your journal.
            </div>
          ) : (
            recent.map((t) => <TradeRow key={t.id} trade={t} />)
          )}
        </div>
      </div>
    </div>
  );
}
