import { Link, Navigate } from "react-router-dom";
import { useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Calendar, LineChart, ImageIcon } from "lucide-react";

export default function Landing() {
  const { session, loading } = useSession();
  if (loading) return null;
  if (session) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-[1180px] px-5 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-sm">L</div>
            <span className="font-display text-[15px]">Ledger</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 md:px-10 pt-20 md:pt-32 pb-16">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-5">A trading journal</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight max-w-4xl">
          Write the trade.{" "}
          <span className="italic text-muted-foreground">Read the trader.</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
          A quiet, beautiful place to log every position — pair, timeframe, risk, screenshot — and watch your edge take shape over weeks and months.
        </p>
        <div className="mt-9 flex items-center gap-3">
          <Button asChild size="lg" className="gap-1.5">
            <Link to="/auth">Start journaling <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <span className="text-xs text-muted-foreground">Free · no email verification</span>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 md:px-10 pb-24 grid md:grid-cols-2 gap-3">
        {[
          { icon: BookOpen, title: "A clean log", body: "Each entry is a card: date, pair, timeframe, risk, result. Searchable. Editable. Yours." },
          { icon: ImageIcon, title: "Charts attached", body: "Upload a screenshot of every setup, or paste a TradingView link. The story stays with the trade." },
          { icon: Calendar, title: "A calendar of conviction", body: "Days bloom green or fade red. The shape of your month, at a glance." },
          { icon: LineChart, title: "Equity, in pages", body: "A monthly cumulative curve drawn from your own numbers. No fluff." },
        ].map((f) => (
          <div key={f.title} className="card-flat p-7 hover:bg-muted/30 transition-colors">
            <f.icon className="h-5 w-5 text-muted-foreground mb-5" />
            <div className="font-display text-xl mb-1.5">{f.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-[1180px] px-5 md:px-10 h-14 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Ledger</span>
          <Link to="/auth" className="hover:text-foreground">Sign in →</Link>
        </div>
      </footer>
    </div>
  );
}
