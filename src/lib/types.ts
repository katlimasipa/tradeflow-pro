export type Timeframe = "M1" | "M5" | "M15" | "H1" | "H4" | "D1";
export type Result = "Win" | "Loss";

export interface Trade {
  id: string;
  date: string; // ISO yyyy-mm-dd
  pair: string;
  timeframe: Timeframe;
  riskPct: number;
  result: Result;
  pnl: number;
  pnlPct: number;
  createdAt: number;
}

export const TIMEFRAMES: Timeframe[] = ["M1", "M5", "M15", "H1", "H4", "D1"];
