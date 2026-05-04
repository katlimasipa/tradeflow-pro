import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const { session, loading } = useSession();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/app" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/app` },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Account created");
      nav("/app", { replace: true });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      nav("/app", { replace: true });
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex flex-col justify-between p-12 bg-surface-sunk relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-sm">LZ</div>
          <span className="font-display text-[15px]">LedgerZar</span>
        </div>
        <div className="relative z-10">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">A trading journal</div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight max-w-md">
            Write the trade.<br />
            <span className="italic text-muted-foreground">Read the trader.</span>
          </h1>
          <p className="mt-5 text-sm text-muted-foreground max-w-sm leading-relaxed">
            A quiet place to log every position, attach the chart, and watch your edge appear over time.
          </p>
        </div>
        <div className="text-xs text-muted-foreground num">© {new Date().getFullYear()} LedgerZar</div>
        <div aria-hidden className="absolute -right-32 top-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-primary/[0.04] blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 mb-10">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-sm">LZ</div>
            <span className="font-display text-[15px]">LedgerZar</span>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            {mode === "signin" ? "Welcome back" : "Get started"}
          </div>
          <h2 className="font-display text-3xl mb-8">
            {mode === "signin" ? "Sign in to your journal" : "Create your journal"}
          </h2>

          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Password</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={busy} className="mt-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>New here?{" "}
                <button onClick={() => setMode("signup")} className="text-foreground underline-offset-4 hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>Already have one?{" "}
                <button onClick={() => setMode("signin")} className="text-foreground underline-offset-4 hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
