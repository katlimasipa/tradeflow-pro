import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTrades } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { MonthCalendar } from "@/components/MonthCalendar";
import { TradeRow } from "@/components/TradeRow";
import { Button } from "@/components/ui/button";
import { TradeDialog } from "@/components/TradeDialog";
import { formatMoney, formatPct } from "@/lib/analytics";

export default function CalendarPage() {
  const { trades } = useTrades();
  const [refDate, setRefDate] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const dayTrades = useMemo(
    () => (selected ? trades.filter((t) => t.date === selected) : []),
    [trades, selected]
  );
  const dayPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
  const dayPct = dayTrades.reduce((s, t) => s + t.pnlPct, 0);

  return (
    <div>
      <PageHeader eyebrow="By the day" title="Calendar" />

      <MonthCalendar
        trades={trades}
        refDate={refDate}
        onChangeMonth={setRefDate}
        onSelectDay={setSelected}
        selectedDay={selected}
      />

      {selected && (
        <div className="mt-8 animate-rise">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Day</div>
              <h2 className="font-display text-2xl">
                {new Date(selected + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {dayTrades.length > 0 && (
                <div className="text-right">
                  <div className={`num font-display text-xl ${dayPnl >= 0 ? "text-win" : "text-loss"}`}>
                    {formatMoney(dayPnl)}
                  </div>
                  <div className="text-xs text-muted-foreground num">{formatPct(dayPct)} · {dayTrades.length} trades</div>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>

          <div className="card-flat overflow-hidden">
            {dayTrades.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No trades on this day.</div>
            ) : (
              dayTrades.map((t) => <TradeRow key={t.id} trade={t} />)
            )}
          </div>
        </div>
      )}

      <TradeDialog open={open} onOpenChange={setOpen} defaultDate={selected ?? undefined} />
    </div>
  );
}
