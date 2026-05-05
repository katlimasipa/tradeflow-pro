import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Calendar as CalendarIcon, LineChart, Plus, LogOut, FlaskConical } from "lucide-react";
import { ReactNode, useState } from "react";
import { TradeDialog } from "./TradeDialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { resetTradesCache } from "@/lib/store";
import { resetBacktestCache } from "@/lib/backtest";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/journal", label: "Journal", icon: BookOpen },
  { to: "/app/calendar", label: "Calendar", icon: CalendarIcon },
  { to: "/app/analytics", label: "Analytics", icon: LineChart },
  { to: "/app/backtesting", label: "Backtesting", icon: FlaskConical },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    resetTradesCache();
    resetBacktestCache();
    navigate("/", { replace: true });
  };
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-sidebar">
        <div className="px-5 pt-6 pb-8">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-sm">LZ</div>
            <div className="leading-tight">
              <div className="font-display text-[15px]">LedgerZar</div>
              <div className="text-[11px] text-muted-foreground">Trading journal</div>
            </div>
          </div>
        </div>
        <nav className="px-3 flex flex-col gap-0.5">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-3 grid gap-1.5">
          <Button onClick={() => setOpen(true)} className="w-full justify-start gap-2" size="sm">
            <Plus className="h-4 w-4" /> New trade
          </Button>
          <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
          <div className="px-3 pt-2 text-[10px] text-muted-foreground">
            Built by <a href="https://architeq.co.za" target="_blank" rel="noreferrer" className="hover:text-foreground">Architeq Web Agency</a>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-sm">LZ</div>
            <span className="font-display text-[15px]">LedgerZar</span>
          </div>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Trade
          </Button>
        </div>
        <nav className="flex border-t overflow-x-auto no-scrollbar">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex-1 min-w-max px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 ${
                  isActive ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
                }`
              }
            >
              <n.icon className="h-3.5 w-3.5" />
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="flex-1 min-w-0 pt-[6.5rem] md:pt-0">
        <div className="mx-auto max-w-[1180px] px-5 md:px-10 py-8 md:py-12">{children}</div>
      </main>

      <TradeDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
