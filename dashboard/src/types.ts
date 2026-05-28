export interface MarketSnapshot {
  symbol: string;
  snapshot_date: string;
  latest_price: number;
  open_price: number;
  day_change: number;
  day_change_pct: number;
  return_7d_pct: number;
  return_30d_pct: number;
  return_90d_pct: number;
  rolling_30d_volatility: number;
  drawdown_from_90d_high_pct: number;
  stress_flag: boolean;
  currency: string;
  market_time: string;
  ingested_at: string;
}
