import { Trash2, Pencil, Image as ImageIcon, Link2 } from "lucide-react";
import { useState } from "react";
import { useTrades } from "@/lib/store";
import { formatMoney, formatPct } from "@/lib/analytics";
import type { Trade } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TradeDialog } from "./TradeDialog";
import { TradePreview } from "./TradePreview";
import { Button } from "@/components/ui/button";

export function TradeRow({ trade }: { trade: Trade }) {
  const { deleteTrade } = useTrades();
  const [edit, setEdit] = useState(false);
  const [preview, setPreview] = useState(false);
  const win = trade.result === "Win";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setPreview(true)}
        onKeyDown={(e) => { if (e.key === "Enter") setPreview(true); }}
        className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[110px_1fr_90px_90px_110px_120px_auto] items-center gap-3 px-4 py-3.5 border-b last:border-b-0 hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer"
      >
        <div className="num text-xs text-muted-foreground">
          {new Date(trade.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
        </div>
        <div className="min-w-0">
          <div className="font-medium tracking-tight flex items-center gap-1.5">
            {trade.pair}
            {trade.screenshotUrl && <ImageIcon className="h-3 w-3 text-muted-foreground" />}
            {trade.screenshotLink && <Link2 className="h-3 w-3 text-muted-foreground" />}
          </div>
          <div className="md:hidden text-xs text-muted-foreground num mt-0.5">
            {trade.timeframe} · Risk {trade.riskPct}% ·{" "}
            <span className={cn(win ? "text-win" : "text-loss")}>{trade.result}</span>
          </div>
        </div>
        <div className="hidden md:block text-xs num text-muted-foreground">{trade.timeframe}</div>
        <div className="hidden md:block text-xs num text-muted-foreground">{trade.riskPct}%</div>
        <div className="hidden md:block">
          <span className={cn(
            "inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium",
            win ? "bg-win-soft text-win" : "bg-loss-soft text-loss"
          )}>
            {trade.result}
          </span>
        </div>
        <div className={cn("text-right md:text-left num text-sm font-medium", win ? "text-win" : "text-loss")}>
          {formatMoney(trade.pnl)}
          <div className="text-[11px] text-muted-foreground font-normal md:inline md:ml-2">{formatPct(trade.pnlPct)}</div>
        </div>
        <div className="hidden md:flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEdit(true)} aria-label="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-loss" onClick={() => deleteTrade(trade.id)} aria-label="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <TradeDialog open={edit} onOpenChange={setEdit} initial={trade} />
      <TradePreview trade={trade} open={preview} onOpenChange={setPreview} onDelete={deleteTrade} />
    </>
  );
}
