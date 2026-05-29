import type { TopMover } from '../types'

interface Props { data: TopMover[] }

export default function TopMoversTable({ data }: Props) {
  const sorted = [...data].sort((a, b) => Math.abs(b.day_change_pct) - Math.abs(a.day_change_pct))

  return (
    <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2d3e] text-gray-400 text-xs">
            <th className="text-left px-4 py-3 font-medium">Symbol</th>
            <th className="text-right px-4 py-3 font-medium">Price</th>
            <th className="text-right px-4 py-3 font-medium">Day %</th>
            <th className="text-right px-4 py-3 font-medium">30d %</th>
            <th className="text-left px-4 py-3 font-medium">Why</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const dayPos = row.day_change_pct >= 0
            const d30Pos = row.return_30d_pct >= 0
            return (
              <tr
                key={`${row.symbol}-${i}`}
                className={`border-b border-[#2a2d3e] last:border-0 ${row.stress_flag ? 'bg-red-950/20' : ''}`}
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-white font-medium">{row.symbol}</span>
                  {row.stress_flag && (
                    <span className="ml-2 text-xs text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded">stress</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-200">
                  {row.latest_price?.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${dayPos ? 'text-green-400' : 'text-red-400'}`}>
                  {dayPos ? '+' : ''}{row.day_change_pct?.toFixed(2)}%
                </td>
                <td className={`px-4 py-3 text-right font-mono ${d30Pos ? 'text-green-400' : 'text-red-400'}`}>
                  {d30Pos ? '+' : ''}{row.return_30d_pct?.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-gray-300 text-xs max-w-xs">
                  {row.why_summary}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
