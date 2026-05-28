import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { MarketSnapshot } from '../types'

interface Props { data: MarketSnapshot[] }

export default function DayChangeChart({ data }: Props) {
  const rows = [...data]
    .sort((a, b) => b.day_change_pct - a.day_change_pct)
    .map(r => ({ symbol: r.symbol, pct: Number(r.day_change_pct) }))

  return (
    <div className="bg-[#1a1d2e] rounded-lg p-4 border border-[#2a2d3e]">
      <h2 className="text-sm font-medium text-gray-300 mb-4 m-0">Day Change %</h2>
      <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 36)}>
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
          <XAxis
            type="number"
            tickFormatter={v => `${v}%`}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#2a2d3e' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="symbol"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            width={70}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Day change']}
            contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 6 }}
            labelStyle={{ color: '#e5e7eb' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <ReferenceLine x={0} stroke="#2a2d3e" />
          <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
            {rows.map(r => (
              <Cell key={r.symbol} fill={r.pct >= 0 ? '#4ade80' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
