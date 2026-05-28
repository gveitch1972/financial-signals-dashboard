import type { MarketSnapshot } from '../types'

interface Props { data: MarketSnapshot[] }

export default function KpiStrip({ data }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {data.map(row => {
        const pos = row.day_change_pct >= 0
        return (
          <div key={row.symbol} className="bg-[#1a1d2e] rounded-lg p-4 border border-[#2a2d3e]">
            <div className="text-xs text-gray-400 mb-1 font-mono">{row.symbol}</div>
            <div className="text-xl font-semibold text-white">
              {row.latest_price?.toFixed(2)}
            </div>
            <div className={`text-sm mt-1 font-mono ${pos ? 'text-green-400' : 'text-red-400'}`}>
              {pos ? '+' : ''}{row.day_change_pct?.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-2">{row.currency}</div>
          </div>
        )
      })}
    </div>
  )
}
