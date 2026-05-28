import { useEffect, useState } from 'react'
import type { MarketSnapshot } from './types'
import KpiStrip from './components/KpiStrip'
import DayChangeChart from './components/DayChangeChart'
import ReturnsChart from './components/ReturnsChart'
import './App.css'

const DATA_URL = '/data/daily_market_snapshot.json'

export default function App() {
  const [data, setData] = useState<MarketSnapshot[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(DATA_URL)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then(text => JSON.parse(text.replace(/:\s*NaN/g, ': null')))
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  const latest = (() => {
    if (!data) return null
    const maxDate = data.reduce((m, r) => r.snapshot_date > m ? r.snapshot_date : m, '')
    const bySymbol = new Map<string, MarketSnapshot>()
    data
      .filter(r => r.snapshot_date === maxDate)
      .forEach(r => bySymbol.set(r.symbol, r))
    return [...bySymbol.values()]
  })()

  const lastUpdated = latest?.[0]?.snapshot_date ?? '—'

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-white m-0">Financial Signals</h1>
        <p className="text-sm text-gray-400 mt-1">Last updated: {lastUpdated}</p>
      </header>

      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded p-4 text-red-300 text-sm">
          Failed to load data: {error}
        </div>
      )}

      {!data && !error && (
        <div className="text-gray-400 text-sm">Loading…</div>
      )}

      {latest && (
        <>
          <KpiStrip data={latest} />
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DayChangeChart data={latest} />
            <ReturnsChart data={latest} />
          </div>
        </>
      )}
    </div>
  )
}
