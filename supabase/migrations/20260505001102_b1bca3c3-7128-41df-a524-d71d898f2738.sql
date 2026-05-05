
CREATE TABLE public.backtest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  pair TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.backtest_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions select own" ON public.backtest_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions insert own" ON public.backtest_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions update own" ON public.backtest_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sessions delete own" ON public.backtest_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER backtest_sessions_updated_at
BEFORE UPDATE ON public.backtest_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.backtest_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.backtest_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  pair TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  risk_pct NUMERIC NOT NULL DEFAULT 0,
  result TEXT NOT NULL,
  pnl NUMERIC NOT NULL DEFAULT 0,
  pnl_pct NUMERIC NOT NULL DEFAULT 0,
  screenshot_url TEXT,
  screenshot_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.backtest_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bt_trades select own" ON public.backtest_trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bt_trades insert own" ON public.backtest_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bt_trades update own" ON public.backtest_trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bt_trades delete own" ON public.backtest_trades FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_backtest_trades_session ON public.backtest_trades(session_id);

CREATE TRIGGER backtest_trades_updated_at
BEFORE UPDATE ON public.backtest_trades
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
