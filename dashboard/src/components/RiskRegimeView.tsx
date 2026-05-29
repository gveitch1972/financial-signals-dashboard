import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { CrossSignal } from '../types'

interface Props { data: CrossSignal[] }

const REGIME_COLOUR: Record<string, string> = {
  stress: '#f87171',
  elevated: '#facc15',
  calm: '#4ade80',
}

export default function RiskRegimeView({ data }: Props) {
  const sorted = [...data].sort((a, b) => a.as_of_date.localeCompare(b.as_of_date))
  const latest = sorted[sorted.length - 1]
  const regimeColour = REGIME_COLOUR[latest?.risk_regime] ?? '#9ca3af'

  const chartData = sorted.map(r => ({
    date: r.as_of_date,
    return_30d: Number(r.market_avg_return_30d_pct),
    stress_symbols: Number(r.market_stress_symbols),
    fx_stress: Number(r.fx_stress_pairs),
  }))

  return (
    <div className="space-y-6">
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Current Regime</div>
            <div className="text-lg font-semibold capitalize" style={{ color: regimeColour }}>
              {latest.risk_regime}
            </div>
            <div className="text-xs text-gray-500 mt-1">{latest.as_of_date}</div>
          </div>
          <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Market Avg 30d</div>
            <div className={`text-lg font-semibold ${latest.market_avg_return_30d_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {latest.market_avg_return_30d_pct >= 0 ? '+' : ''}{latest.market_avg_return_30d_pct?.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">{latest.market_up_symbols}↑ {latest.market_down_symbols}↓</div>
          </div>
          <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Stressed Symbols</div>
            <div className={`text-lg font-semibold ${latest.market_stress_symbols > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {latest.market_stress_symbols}
            </div>
            <div className="text-xs text-gray-500 mt-1">of {latest.market_symbols_count} tracked</div>
          </div>
          <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">FX Stress Pairs</div>
            <div className={`text-lg font-semibold ${latest.fx_stress_pairs > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {latest.fx_stress_pairs}
            </div>
            <div className="text-xs text-gray-500 mt-1">{latest.fx_strengthening_pairs}↑ {latest.fx_weakening_pairs}↓ pairs</div>
          </div>
        </div>
      )}

      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg p-4">
        <h2 className="text-sm font-medium text-gray-300 mb-4 m-0">Market Avg 30d Return % Over Time</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: '#2a2d3e' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip
              formatter={(v, name) => [`${Number(v).toFixed(1)}${name === 'return_30d' ? '%' : ''}`, name === 'return_30d' ? 'Avg 30d return' : name]}
              contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 6 }}
              labelStyle={{ color: '#e5e7eb', fontSize: 11 }}
            />
            <Legend formatter={v => v === 'return_30d' ? 'Avg 30d return %' : v} wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Area type="monotone" dataKey="return_30d" stroke="#818cf8" fill="url(#returnGrad)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2d3e] text-gray-400 text-xs">
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Regime</th>
              <th className="text-right px-4 py-3 font-medium">30d Avg %</th>
              <th className="text-right px-4 py-3 font-medium">Stressed</th>
              <th className="text-right px-4 py-3 font-medium">Up / Down</th>
            </tr>
          </thead>
          <tbody>
            {[...sorted].reverse().slice(0, 30).map(row => (
              <tr key={row.as_of_date} className="border-b border-[#2a2d3e] last:border-0">
                <td className="px-4 py-2 font-mono text-gray-300 text-xs">{row.as_of_date}</td>
                <td className="px-4 py-2 text-xs">
                  <span className="px-1.5 py-0.5 rounded capitalize" style={{ background: (REGIME_COLOUR[row.risk_regime] ?? '#9ca3af') + '33', color: REGIME_COLOUR[row.risk_regime] ?? '#9ca3af' }}>
                    {row.risk_regime}
                  </span>
                </td>
                <td className={`px-4 py-2 text-right font-mono text-xs ${row.market_avg_return_30d_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {row.market_avg_return_30d_pct >= 0 ? '+' : ''}{row.market_avg_return_30d_pct?.toFixed(1)}%
                </td>
                <td className={`px-4 py-2 text-right font-mono text-xs ${row.market_stress_symbols > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {row.market_stress_symbols}
                </td>
                <td className="px-4 py-2 text-right font-mono text-xs text-gray-400">
                  {row.market_up_symbols}↑ {row.market_down_symbols}↓
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
