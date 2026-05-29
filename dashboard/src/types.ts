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

export interface FxSignal {
  currency_pair: string;
  rate_date: string;
  base_currency: string;
  quote_currency: string;
  rate: number;
  daily_change: number;
  daily_change_pct: number;
  weekly_change_pct: number;
  return_30d_pct: number;
  rolling_30d_volatility: number;
  trend_signal: string;
  stress_flag: boolean;
  ingested_at: string;
}

export interface TopMover {
  as_of_date: string;
  symbol: string;
  latest_price: number;
  day_change_pct: number;
  return_30d_pct: number;
  stress_flag: boolean;
  fx_context: string | null;
  macro_context: string | null;
  why_summary: string;
}

export interface CrossSignal {
  as_of_date: string;
  risk_regime: string;
  market_symbols_count: number;
  market_up_symbols: number;
  market_down_symbols: number;
  market_stress_symbols: number;
  market_avg_day_change_pct: number;
  market_avg_return_30d_pct: number;
  market_avg_return_90d_pct: number;
  fx_strengthening_pairs: number;
  fx_weakening_pairs: number;
  fx_stress_pairs: number;
  fx_avg_daily_change_pct: number;
  fx_avg_return_30d_pct: number;
  macro_up_indicators: number;
  macro_down_indicators: number;
  macro_avg_period_change_pct: number;
  macro_avg_year_over_year_pct: number;
}
