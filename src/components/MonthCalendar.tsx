import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tradesByDay, formatPct } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { Trade } from "@/lib/types";

interface Props {
  trades: Trade[];
  refDate: Date;
  onChangeMonth: (d: Date) => void;
  onSelectDay?: (date: string) => void;
  selectedDay?: string | null;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthCalendar({ trades, refDate, onChangeMonth, onSelectDay, selectedDay }: Props) {
  const grid = useMemo(() => {
    const y = refDate.getFullYear();
    const m = refDate.getMonth();
    const first = new Date(y, m, 1);
    const startOffset = (first.getDay() + 6) % 7; // Mon-first
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: { date: string | null; day: number | null }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ date: null, day: null });
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: `${y}-${String(m + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
        day: i,
      });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, day: null });
    return cells;
  }, [refDate]);

  const byDay = useMemo(() => tradesByDay(trades), [trades]);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="card-flat overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Calendar</div>
          <div className="font-display text-2xl mt-0.5">
            {refDate.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeMonth(new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onChangeMonth(new Date())}>Today</Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeMonth(new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 sm:px-2 pt-3">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-1 sm:px-2 py-1 text-center sm:text-left">
            <span className="sm:hidden">{d.slice(0, 1)}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 p-1.5 sm:p-2 pt-1">
        {grid.map((cell, i) => {
          if (!cell.date) return <div key={i} className="min-h-[64px] sm:aspect-[4/3]" />;
          const dayTrades = byDay.get(cell.date) ?? [];
          const totalPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
          const totalPct = dayTrades.reduce((s, t) => s + t.pnlPct, 0);
          const has = dayTrades.length > 0;
          const profit = totalPnl > 0;
          const loss = totalPnl < 0;
          const isToday = cell.date === todayStr;
          const isSelected = cell.date === selectedDay;

          return (
            <button
              key={i}
              onClick={() => onSelectDay?.(cell.date!)}
              className={cn(
                "group relative min-h-[64px] sm:min-h-0 sm:aspect-[4/3] rounded-md border text-left p-1.5 sm:p-2 transition-all flex flex-col",
                "hover:border-foreground/30 active:scale-[0.98]",
                has && profit && "bg-win-soft border-win/20",
                has && loss && "bg-loss-soft border-loss/20",
                !has && "bg-surface",
                isSelected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[11px] sm:text-xs num font-medium",
                  isToday && "h-5 w-5 rounded-full bg-foreground text-background grid place-items-center text-[10px] sm:text-[11px]"
                )}>
                  {cell.day}
                </span>
              </div>

              {has && (
                <div className="mt-auto">
                  <div className={cn(
                    "text-[10px] sm:text-[11px] num font-semibold leading-tight",
                    profit && "text-win",
                    loss && "text-loss"
                  )}>
                    {formatPct(totalPct)}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {dayTrades.length} {dayTrades.length === 1 ? "trade" : "trades"}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
