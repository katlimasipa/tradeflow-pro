import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { cumulativePctSeriesForMonth } from "@/lib/analytics";
import type { Trade } from "@/lib/types";

interface Props {
  trades: Trade[];
  refDate: Date;
}

export function MonthlyChart({ trades, refDate }: Props) {
  const data = useMemo(() => cumulativePctSeriesForMonth(trades, refDate), [trades, refDate]);
  const last = data[data.length - 1]?.value ?? 0;
  const positive = last >= 0;

  return (
    <div className="card-flat p-5 md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Cumulative profit · {refDate.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </div>
          <div className={`mt-2 font-display text-4xl num ${positive ? "text-win" : "text-loss"}`}>
            {last >= 0 ? "+" : ""}{last.toFixed(2)}%
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{trades.length} trades this month</div>
      </div>

      <div className="h-64 mt-6 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="lineFade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={positive ? "hsl(var(--win))" : "hsl(var(--loss))"} stopOpacity="0.3" />
                <stop offset="100%" stopColor={positive ? "hsl(var(--win))" : "hsl(var(--loss))"} stopOpacity="1" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              interval={3}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" />
            <Tooltip
              cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "2 4" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "Geist Mono",
              }}
              labelFormatter={(l) => `Day ${l}`}
              formatter={(v: number) => [`${v >= 0 ? "+" : ""}${v.toFixed(2)}%`, "Cumulative"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#lineFade)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: positive ? "hsl(var(--win))" : "hsl(var(--loss))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
