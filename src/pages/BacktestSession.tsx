import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useBacktestSession, type BacktestTrade } from "@/lib/backtest";
import { StatCard } from "@/components/StatCard";
import { BacktestTradeDialog } from "@/components/BacktestTradeDialog";
import { formatMoney, formatPct } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export default function BacktestSession() {
  const { id } = useParams();
  const { session, trades, addTrade, updateTrade, deleteTrade } = useBacktestSession(id);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BacktestTrade | undefined>();

  const stats = useMemo(() => {
    const wins = trades.filter((t) => t.result === "Win").length;
    const losses = trades.filter((t) => t.result === "Loss").length;
    const be = trades.filter((t) => t.result === "Break-even").length;
    const pnl = trades.reduce((s, t) => s + Number(t.pnl || 0), 0);
    const pnlPct = trades.reduce((s, t) => s + Number(t.pnlPct || 0), 0);
    const totalRisk = trades.reduce((s, t) => s + Number(t.riskPct || 0), 0);
    const wrDenom = wins + losses;
    return { 
      total: trades.length, 
      wins, 
      losses, 
      be,
      pnl, 
      pnlPct, 
      totalRisk, 
      winRate: wrDenom ? (wins / wrDenom) * 100 : 0 
    };
  }, [trades]);

  const series = useMemo(() => {
    let running = 0;
    return trades.map((t, i) => {
      running += Number(t.pnlPct || 0);
      return { idx: i + 1, value: running, date: t.date };
    });
  }, [trades]);

  const last = series[series.length - 1]?.value ?? 0;
  const positive = last >= 0;

  if (!session) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <div className="mb-4">Session not found.</div>
        <Link to="/app/backtesting" className="text-sm underline">Back to backtesting</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/app/backtesting" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="h-3.5 w-3.5" /> All sessions
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{session.pair} · Backtest</div>
          <h1 className="font-display text-3xl md:text-4xl mt-1">{session.name}</h1>
          {(session.startDate || session.endDate) && (
            <div className="text-sm num text-muted-foreground mt-1">
              {session.startDate && new Date(session.startDate + "T00:00:00").toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              {session.startDate && session.endDate && " – "}
              {session.endDate && new Date(session.endDate + "T00:00:00").toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </div>
          )}
        </div>
        <Button onClick={() => { setEditing(undefined); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add trade
        </Button>
      </div>

      {session.notes && (
        <div className="card-flat p-4 mb-6 text-sm text-muted-foreground whitespace-pre-wrap">{session.notes}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard label="Trades" value={stats.total.toString()} />
        <StatCard label="Wins" value={stats.wins.toString()} tone="win" />
        <StatCard label="Losses" value={stats.losses.toString()} tone="loss" />
        <StatCard label="Break-evens" value={stats.be.toString()} />
        <StatCard label="Win rate" value={`${stats.winRate.toFixed(1)}%`} />
        <StatCard label="Total PnL" value={formatMoney(stats.pnl)} tone={stats.pnl >= 0 ? "win" : "loss"} />
        <StatCard label="Total PnL %" value={formatPct(stats.pnlPct)} tone={stats.pnlPct >= 0 ? "win" : "loss"} />
        <StatCard label="Total risk" value={`${stats.totalRisk.toFixed(2)}%`} />
        <StatCard label="Avg / trade" value={stats.total ? formatMoney(stats.pnl / stats.total) : "—"} />
      </div>

      <div className="card-flat p-5 md:p-6 mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Cumulative profit</div>
            <div className={cn("mt-2 font-display text-4xl num", positive ? "text-win" : "text-loss")}>
              {last >= 0 ? "+" : ""}{last.toFixed(2)}%
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{trades.length} trades</div>
        </div>
        <div className="h-64 mt-6 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="idx" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={40} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                labelFormatter={(l) => `Trade #${l}`}
                formatter={(v: number) => [`${v >= 0 ? "+" : ""}${v.toFixed(2)}%`, "Cumulative"]}
              />
              <Line type="monotone" dataKey="value" stroke={positive ? "hsl(var(--win))" : "hsl(var(--loss))"} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl mb-3">Trades</h2>
        <div className="card-flat overflow-hidden">
          {trades.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No trades yet — start logging your backtest.</div>
          ) : (
            trades.map((t) => {
              const win = t.result === "Win";
              const loss = t.result === "Loss";
              const be = t.result === "Break-even";
              return (
                <div key={t.id} className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[110px_1fr_70px_70px_90px_120px_auto] items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                  <div className="num text-xs text-muted-foreground">
                    {new Date(t.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "2-digit" })}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium tracking-tight">{t.pair}</div>
                    <div className="md:hidden text-xs text-muted-foreground num mt-0.5">{t.timeframe} · Risk {t.riskPct}%</div>
                  </div>
                  <div className="hidden md:block text-xs num text-muted-foreground">{t.timeframe}</div>
                  <div className="hidden md:block text-xs num text-muted-foreground">{t.riskPct}%</div>
                  <div className="hidden md:block">
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium",
                      win && "bg-win-soft text-win",
                      loss && "bg-loss-soft text-loss",
                      be && "bg-muted text-muted-foreground"
                    )}>
                      {t.result}
                    </span>
                  </div>
                  <div className={cn(
                    "text-right md:text-left num text-sm font-medium",
                    win && "text-win",
                    loss && "text-loss",
                    be && "text-muted-foreground"
                  )}>
                    {formatMoney(t.pnl)}
                    <div className="text-[11px] text-muted-foreground font-normal md:inline md:ml-2">{formatPct(t.pnlPct)}</div>
                  </div>
                  <div className="flex justify-end gap-0.5 col-span-3 md:col-span-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(t); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-loss" onClick={() => deleteTrade(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BacktestTradeDialog
        open={open}
        onOpenChange={setOpen}
        defaultPair={session.pair}
        initial={editing}
        onSave={addTrade}
        onUpdate={updateTrade}
      />
    </div>
  );
}
