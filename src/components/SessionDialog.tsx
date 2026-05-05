import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useBacktestSessions, type BacktestSession } from "@/lib/backtest";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: BacktestSession;
}

export function SessionDialog({ open, onOpenChange, initial }: Props) {
  const { createSession, updateSession } = useBacktestSessions();
  const [name, setName] = useState("");
  const [pair, setPair] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setPair(initial?.pair ?? "");
      setStart(initial?.startDate ?? "");
      setEnd(initial?.endDate ?? "");
      setNotes(initial?.notes ?? "");
    }
  }, [open, initial]);

  const submit = async () => {
    if (!name.trim() || !pair.trim()) {
      toast.error("Name and pair are required");
      return;
    }
    const payload = {
      name: name.trim(),
      pair: pair.toUpperCase().trim(),
      startDate: start || null,
      endDate: end || null,
      notes: notes.trim() || null,
    };
    if (initial) {
      await updateSession(initial.id, payload);
      toast.success("Session updated");
    } else {
      await createSession(payload);
      toast.success("Session created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{initial ? "Edit session" : "New backtesting session"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 mt-2">
          <Field label="Session name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="EURUSD Backtesting Session" />
          </Field>
          <Field label="Pair">
            <Input value={pair} onChange={(e) => setPair(e.target.value)} placeholder="EURUSD" className="uppercase" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From"><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="num" /></Field>
            <Field label="To"><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="num" /></Field>
          </div>
          <Field label="Strategy notes (optional)">
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the setup, rules, hypothesis…" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit}>{initial ? "Save" : "Create session"}</Button>
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
