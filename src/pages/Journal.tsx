import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useTrades } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { TradeRow } from "@/components/TradeRow";
import { TradeDialog } from "@/components/TradeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Journal() {
  const { trades } = useTrades();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return trades;
    return trades.filter(
      (t) =>
        t.pair.toLowerCase().includes(s) ||
        t.timeframe.toLowerCase().includes(s) ||
        t.result.toLowerCase().includes(s) ||
        t.date.includes(s)
    );
  }, [trades, q]);

  return (
    <div>
      <PageHeader eyebrow="Trade log" title="Journal">
        <Button onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> New trade
        </Button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pair, timeframe, date…" className="pl-9" />
        </div>
        <div className="text-xs text-muted-foreground num ml-auto">{filtered.length} entries</div>
      </div>

      <div className="card-flat overflow-hidden">
        <div className="hidden md:grid grid-cols-[110px_1fr_90px_90px_110px_120px_auto] gap-3 px-4 py-2.5 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-surface-sunk/50">
          <div>Date</div>
          <div>Pair</div>
          <div>TF</div>
          <div>Risk</div>
          <div>Result</div>
          <div>PnL</div>
          <div></div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="font-display text-2xl mb-2">A blank page.</div>
            <div className="text-sm text-muted-foreground mb-5">
              Every trader starts here. Log your first trade.
            </div>
            <Button onClick={() => setOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> New trade
            </Button>
          </div>
        ) : (
          filtered.map((t) => <TradeRow key={t.id} trade={t} />)
        )}
      </div>

      <TradeDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
