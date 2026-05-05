import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Pencil, Trash2, ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatMoney, formatPct } from "@/lib/analytics";
import type { Trade } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TradeDialog } from "./TradeDialog";

interface Props {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDelete?: (id: string) => void;
}

export function TradePreview({ trade, open, onOpenChange, onDelete }: Props) {
  const [edit, setEdit] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  if (!trade) return null;
  const win = trade.result === "Win";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          <div className="p-6 border-b">
            <SheetHeader className="space-y-1 text-left">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                {new Date(trade.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </div>
              <SheetTitle className="font-display text-3xl flex items-center gap-3">
                {trade.pair}
                <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium",
                  win ? "bg-win-soft text-win" : "bg-loss-soft text-loss")}>
                  {trade.result}
                </span>
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="p-6 grid gap-5">
            <div className={cn("rounded-lg p-5 border", win ? "bg-win-soft/40 border-win/20" : "bg-loss-soft/40 border-loss/20")}>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Net result</div>
              <div className={cn("font-display text-4xl num mt-1", win ? "text-win" : "text-loss")}>
                {formatMoney(trade.pnl)}
              </div>
              <div className={cn("num text-sm mt-0.5", win ? "text-win" : "text-loss")}>
                {formatPct(trade.pnlPct)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Timeframe" value={trade.timeframe} />
              <Stat label="Risk" value={`${trade.riskPct}%`} />
            </div>

            {trade.screenshotUrl && (
              <button
                onClick={() => setImgOpen(true)}
                className="rounded-md overflow-hidden border bg-muted/30 group"
              >
                <img src={trade.screenshotUrl} alt={`${trade.pair} chart`} loading="lazy"
                  className="w-full max-h-72 object-contain group-hover:opacity-90 transition-opacity" />
              </button>
            )}

            {trade.screenshotLink && (
              <a href={trade.screenshotLink} target="_blank" rel="noreferrer"
                className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate text-muted-foreground">{trade.screenshotLink}</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </a>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setEdit(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              {onDelete && (
                <Button variant="ghost" className="text-loss hover:text-loss hover:bg-loss-soft/50 gap-2"
                  onClick={() => { onDelete(trade.id); onOpenChange(false); }}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <TradeDialog open={edit} onOpenChange={setEdit} initial={trade} />

      {trade.screenshotUrl && (
        <Dialog open={imgOpen} onOpenChange={setImgOpen}>
          <DialogContent className="max-w-4xl p-2">
            <img src={trade.screenshotUrl} alt={`${trade.pair} screenshot`} className="w-full rounded-md" />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3 bg-surface">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="num text-base mt-0.5 font-medium">{value}</div>
    </div>
  );
}
