import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { MarketSnapshot } from '../types'

interface Props { data: MarketSnapshot[] }

export default function ReturnsChart({ data }: Props) {
  const rows = data.map(r => ({
    symbol: r.symbol,
    '7d': Number(r.return_7d_pct),
    '30d': Number(r.return_30d_pct),
    '90d': Number(r.return_90d_pct),
  }))

  return (
    <div className="bg-[#1a1d2e] rounded-lg p-4 border border-[#2a2d3e]">
      <h2 className="text-sm font-medium text-gray-300 mb-4 m-0">Returns by Period</h2>
      <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 36)}>
        <BarChart data={rows} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
          <XAxis
            dataKey="symbol"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#2a2d3e' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => `${v}%`}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v, name) => [`${Number(v).toFixed(2)}%`, name]}
            contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 6 }}
            labelStyle={{ color: '#e5e7eb' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
          <ReferenceLine y={0} stroke="#2a2d3e" />
          <Bar dataKey="7d" fill="#818cf8" radius={[3, 3, 0, 0]} />
          <Bar dataKey="30d" fill="#38bdf8" radius={[3, 3, 0, 0]} />
          <Bar dataKey="90d" fill="#a78bfa" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
