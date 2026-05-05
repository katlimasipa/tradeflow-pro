import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/lib/auth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import CalendarPage from "./pages/CalendarPage";
import Analytics from "./pages/Analytics";
import Backtesting from "./pages/Backtesting";
import BacktestSession from "./pages/BacktestSession";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedApp() {
  const { session, loading } = useSession();
  if (loading) return null;
  if (!session) return <Navigate to="/" replace />;
  return (
    <AppShell>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="journal" element={<Journal />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="backtesting" element={<Backtesting />} />
        <Route path="backtesting/:id" element={<BacktestSession />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app/*" element={<ProtectedApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
