import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrades } from "@/lib/store";
import { TIMEFRAMES, type Result, type Timeframe, type Trade } from "@/lib/types";
import { todayISO } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Trade;
  defaultDate?: string;
}

export function TradeDialog({ open, onOpenChange, initial, defaultDate }: Props) {
  const { addTrade, updateTrade } = useTrades();
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? todayISO());
  const [pair, setPair] = useState(initial?.pair ?? "");
  const [timeframe, setTimeframe] = useState<Timeframe>(initial?.timeframe ?? "H1");
  const [riskPct, setRiskPct] = useState<string>(initial?.riskPct?.toString() ?? "1");
  const [result, setResult] = useState<Result>(initial?.result ?? "Win");
  const [pnl, setPnl] = useState<string>(initial?.pnl?.toString() ?? "");
  const [pnlPct, setPnlPct] = useState<string>(initial?.pnlPct?.toString() ?? "");

  useEffect(() => {
    if (open) {
      setDate(initial?.date ?? defaultDate ?? todayISO());
      setPair(initial?.pair ?? "");
      setTimeframe(initial?.timeframe ?? "H1");
      setRiskPct(initial?.riskPct?.toString() ?? "1");
      setResult(initial?.result ?? "Win");
      setPnl(initial?.pnl?.toString() ?? "");
      setPnlPct(initial?.pnlPct?.toString() ?? "");
    }
  }, [open, initial, defaultDate]);

  const submit = () => {
    if (!pair.trim()) {
      toast.error("Pair is required");
      return;
    }
    const payload = {
      date,
      pair: pair.toUpperCase().trim(),
      timeframe,
      riskPct: Number(riskPct) || 0,
      result,
      pnl: Number(pnl) || 0,
      pnlPct: Number(pnlPct) || 0,
    };
    if (initial) {
      updateTrade(initial.id, payload);
      toast.success("Trade updated");
    } else {
      addTrade(payload);
      toast.success("Trade logged");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{initial ? "Edit trade" : "New trade"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="num" />
            </Field>
            <Field label="Pair">
              <Input placeholder="EURUSD" value={pair} onChange={(e) => setPair(e.target.value)} className="uppercase" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Timeframe">
              <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Risk %">
              <Input type="number" step="0.1" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} className="num" />
            </Field>
          </div>

          <Field label="Result">
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-md">
              {(["Win", "Loss"] as Result[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={cn(
                    "py-1.5 text-sm rounded-[6px] transition-colors",
                    result === r
                      ? r === "Win"
                        ? "bg-win text-win-foreground"
                        : "bg-loss text-loss-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Total PnL ($)">
              <Input type="number" step="0.01" value={pnl} onChange={(e) => setPnl(e.target.value)} className="num" placeholder="0.00" />
            </Field>
            <Field label="Total PnL (%)">
              <Input type="number" step="0.01" value={pnlPct} onChange={(e) => setPnlPct(e.target.value)} className="num" placeholder="0.00" />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit}>{initial ? "Save changes" : "Log trade"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</Label>
      {children}
    </div>
  );
}
