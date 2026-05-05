import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrades, uploadScreenshot } from "@/lib/store";
import { TIMEFRAMES, type Result, type Timeframe, type Trade } from "@/lib/types";
import { todayISO } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";

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
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(initial?.screenshotUrl ?? null);
  const [screenshotLink, setScreenshotLink] = useState<string>(initial?.screenshotLink ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDate(initial?.date ?? defaultDate ?? todayISO());
      setPair(initial?.pair ?? "");
      setTimeframe(initial?.timeframe ?? "H1");
      setRiskPct(initial?.riskPct?.toString() ?? "1");
      setResult(initial?.result ?? "Win");
      setPnl(initial?.pnl?.toString() ?? "");
      setPnlPct(initial?.pnlPct?.toString() ?? "");
      setScreenshotUrl(initial?.screenshotUrl ?? null);
      setScreenshotLink(initial?.screenshotLink ?? "");
    }
  }, [open, initial, defaultDate]);

  const handleResultChange = (r: Result) => {
    setResult(r);
    if (r === "Break-even") {
      setPnl("0");
      setPnlPct("0");
    }
  };

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }
    setUploading(true);
    const url = await uploadScreenshot(file);
    setUploading(false);
    if (url) {
      setScreenshotUrl(url);
      toast.success("Screenshot uploaded");
    } else {
      toast.error("Upload failed");
    }
  };

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
      screenshotUrl: screenshotUrl || null,
      screenshotLink: screenshotLink.trim() || null,
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
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-md">
              {(["Win", "Loss", "Break-even"] as Result[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleResultChange(r)}
                  className={cn(
                    "py-2 text-xs md:text-sm rounded-[6px] transition-colors font-medium",
                    result === r
                      ? r === "Win"
                        ? "bg-win text-win-foreground"
                        : r === "Loss"
                        ? "bg-loss text-loss-foreground"
                        : "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r === "Break-even" ? "BE" : r}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Total PnL ($)">
              <Input 
                type="number" 
                step="0.01" 
                value={pnl} 
                onChange={(e) => setPnl(e.target.value)} 
                className="num" 
                placeholder="0.00" 
                disabled={result === "Break-even"}
              />
            </Field>
            <Field label="Total PnL (%)">
              <Input 
                type="number" 
                step="0.01" 
                value={pnlPct} 
                onChange={(e) => setPnlPct(e.target.value)} 
                className="num" 
                placeholder="0.00" 
                disabled={result === "Break-even"}
              />
            </Field>
          </div>

          <Field label="Screenshot">
            {screenshotUrl ? (
              <div className="relative group rounded-md border overflow-hidden bg-muted/30">
                <img src={screenshotUrl} alt="Trade screenshot" className="w-full max-h-56 object-contain" />
                <button
                  type="button"
                  onClick={() => setScreenshotUrl(null)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/90 border grid place-items-center hover:bg-background"
                  aria-label="Remove screenshot"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 h-20 rounded-md border border-dashed border-input bg-muted/30 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-60"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload image"}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
          </Field>

          <Field label="Screenshot link (optional)">
            <div className="relative">
              <Link2 className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="https://tradingview.com/x/..."
                value={screenshotLink}
                onChange={(e) => setScreenshotLink(e.target.value)}
                className="pl-8"
              />
            </div>
          </Field>

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
