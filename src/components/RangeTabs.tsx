import type { Range } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const RANGES: { v: Range; label: string }[] = [
  { v: "weekly", label: "Week" },
  { v: "monthly", label: "Month" },
  { v: "yearly", label: "Year" },
];

export function RangeTabs({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="inline-flex p-0.5 bg-muted rounded-md">
      {RANGES.map((r) => (
        <button
          key={r.v}
          onClick={() => onChange(r.v)}
          className={cn(
            "px-3 py-1.5 text-xs rounded-[6px] transition-colors",
            value === r.v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
