import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Legend,
} from 'recharts'
import type { FxSignal } from '../types'

interface Props { data: FxSignal[] }

const SIGNAL_COLOURS: Record<string, string> = {
  strong_up: '#4ade80',
  up: '#86efac',
  neutral: '#9ca3af',
  down: '#fca5a5',
  strong_down: '#f87171',
}

const CARD_BG = 'bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg p-4'

export default function FxSignalsView({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.daily_change_pct - a.daily_change_pct)

  const signalCounts = data.reduce<Record<string, number>>((acc, r) => {
    acc[r.trend_signal] = (acc[r.trend_signal] ?? 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(signalCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {sorted.map(row => {
          const pos = row.daily_change_pct >= 0
          const stressed = row.stress_flag
          return (
            <div
              key={row.currency_pair}
              className={`${CARD_BG} ${stressed ? 'border-red-700' : ''}`}
            >
              <div className="text-xs text-gray-400 mb-1 font-mono">{row.currency_pair}</div>
              <div className="text-xl font-semibold text-white">{row.rate?.toFixed(4)}</div>
              <div className={`text-sm mt-1 font-mono ${pos ? 'text-green-400' : 'text-red-400'}`}>
                {pos ? '+' : ''}{row.daily_change_pct?.toFixed(2)}%
              </div>
              <div
                className="text-xs mt-2 px-1.5 py-0.5 rounded inline-block"
                style={{ background: SIGNAL_COLOURS[row.trend_signal] + '33', color: SIGNAL_COLOURS[row.trend_signal] ?? '#9ca3af' }}
              >
                {row.trend_signal?.replace('_', ' ')}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD_BG}>
          <h2 className="text-sm font-medium text-gray-300 mb-4 m-0">Daily Change %</h2>
          <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 36)}>
            <BarChart data={sorted.map(r => ({ pair: r.currency_pair, pct: Number(r.daily_change_pct) }))} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#2a2d3e' }} tickLine={false} />
              <YAxis type="category" dataKey="pair" tick={{ fill: '#9ca3af', fontSize: 11 }} width={70} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`${Number(v).toFixed(2)}%`, 'Day change']} contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 6 }} labelStyle={{ color: '#e5e7eb' }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <ReferenceLine x={0} stroke="#2a2d3e" />
              <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                {sorted.map(r => <Cell key={r.currency_pair} fill={r.daily_change_pct >= 0 ? '#4ade80' : '#f87171'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={CARD_BG}>
          <h2 className="text-sm font-medium text-gray-300 mb-4 m-0">Trend Signal Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name?.replace('_', ' ')} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map(entry => (
                  <Cell key={entry.name} fill={SIGNAL_COLOURS[entry.name] ?? '#9ca3af'} />
                ))}
              </Pie>
              <Legend formatter={v => v.replace('_', ' ')} wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
