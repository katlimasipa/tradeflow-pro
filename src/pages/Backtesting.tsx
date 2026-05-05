import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowUpRight, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useBacktestSessions, type BacktestSession } from "@/lib/backtest";
import { SessionDialog } from "@/components/SessionDialog";

export default function Backtesting() {
  const { sessions, deleteSession } = useBacktestSessions();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BacktestSession | undefined>();

  const formatRange = (s?: string | null, e?: string | null) => {
    if (!s && !e) return null;
    const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", year: "numeric" });
    if (s && e) return `${fmt(s)} – ${fmt(e)}`;
    return fmt((s || e) as string);
  };

  return (
    <div>
      <PageHeader eyebrow="Strategy lab" title="Backtesting">
        <Button onClick={() => { setEditing(undefined); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New session
        </Button>
      </PageHeader>

      {sessions.length === 0 ? (
        <div className="card-flat p-10 md:p-16 text-center">
          <div className="h-12 w-12 rounded-full bg-muted mx-auto grid place-items-center mb-4">
            <FlaskConical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="font-display text-2xl mb-1">No sessions yet</div>
          <div className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
            Create a backtesting session to simulate trades on historical data — kept fully separate from your live journal.
          </div>
          <Button onClick={() => { setEditing(undefined); setOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Create your first session
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => {
            const range = formatRange(s.startDate, s.endDate);
            return (
              <div key={s.id} className="card-flat group p-5 flex flex-col gap-3 hover:border-foreground/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/app/backtesting/${s.id}`} className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.pair}</div>
                    <div className="font-display text-lg leading-tight mt-0.5 truncate">{s.name}</div>
                  </Link>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(s); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-loss" onClick={() => deleteSession(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {range && <div className="text-xs num text-muted-foreground">{range}</div>}
                {s.notes && <p className="text-sm text-muted-foreground line-clamp-3">{s.notes}</p>}
                <Link to={`/app/backtesting/${s.id}`} className="mt-auto pt-2 text-xs text-foreground inline-flex items-center gap-1 hover:gap-1.5 transition-all">
                  Open session <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <SessionDialog open={open} onOpenChange={setOpen} initial={editing} />
    </div>
  );
}
