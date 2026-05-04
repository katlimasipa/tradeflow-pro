import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "win" | "loss";
  className?: string;
}

export function StatCard({ label, value, hint, tone = "default", className }: Props) {
  return (
    <div className={cn("card-flat p-5 animate-rise", className)}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div
        className={cn(
          "mt-3 font-display text-3xl num leading-none",
          tone === "win" && "text-win",
          tone === "loss" && "text-loss"
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-2 text-xs text-muted-foreground num">{hint}</div>}
    </div>
  );
}
