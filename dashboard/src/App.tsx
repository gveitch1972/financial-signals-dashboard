import { useEffect, useState } from 'react'
import type { MarketSnapshot, FxSignal, TopMover, CrossSignal } from './types'
import KpiStrip from './components/KpiStrip'
import DayChangeChart from './components/DayChangeChart'
import ReturnsChart from './components/ReturnsChart'
import FxSignalsView from './components/FxSignalsView'
import TopMoversTable from './components/TopMoversTable'
import RiskRegimeView from './components/RiskRegimeView'
import './App.css'

type Tab = 'market' | 'fx' | 'movers' | 'regime'

function fetchJson<T>(url: string): Promise<T> {
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text() })
    .then(text => JSON.parse(text.replace(/:\s*NaN/g, ': null')))
}

export default function App() {
  const [tab, setTab] = useState<Tab>('market')
  const [snapshots, setSnapshots] = useState<MarketSnapshot[] | null>(null)
  const [fxSignals, setFxSignals] = useState<FxSignal[] | null>(null)
  const [topMovers, setTopMovers] = useState<TopMover[] | null>(null)
  const [crossSignals, setCrossSignals] = useState<CrossSignal[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJson<MarketSnapshot[]>('/data/daily_market_snapshot.json').then(setSnapshots).catch(e => setError(e.message))
  }, [])

  useEffect(() => {
    if (tab === 'fx' && !fxSignals)
      fetchJson<FxSignal[]>('/data/fx_trend_signals.json').then(setFxSignals).catch(e => setError(e.message))
    if (tab === 'movers' && !topMovers)
      fetchJson<TopMover[]>('/data/top_movers_why.json').then(setTopMovers).catch(e => setError(e.message))
    if (tab === 'regime' && !crossSignals)
      fetchJson<CrossSignal[]>('/data/cross_signal_summary.json').then(setCrossSignals).catch(e => setError(e.message))
  }, [tab])

  const latest = (() => {
    if (!snapshots) return null
    const maxDate = snapshots.reduce((m, r) => r.snapshot_date > m ? r.snapshot_date : m, '')
    const bySymbol = new Map<string, MarketSnapshot>()
    snapshots.filter(r => r.snapshot_date === maxDate).forEach(r => bySymbol.set(r.symbol, r))
    return [...bySymbol.values()]
  })()

  const latestFx = (() => {
    if (!fxSignals) return null
    const maxDate = fxSignals.reduce((m, r) => r.rate_date > m ? r.rate_date : m, '')
    return fxSignals.filter(r => r.rate_date === maxDate)
  })()

  const latestMovers = (() => {
    if (!topMovers) return null
    const maxDate = topMovers.reduce((m, r) => r.as_of_date > m ? r.as_of_date : m, '')
    return topMovers.filter(r => r.as_of_date === maxDate)
  })()

  const lastUpdated = latest?.[0]?.snapshot_date ?? '—'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'market', label: 'Market' },
    { id: 'fx', label: 'FX Signals' },
    { id: 'movers', label: 'Top Movers' },
    { id: 'regime', label: 'Risk Regime' },
  ]

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-white m-0">Financial Signals</h1>
        <p className="text-sm text-gray-400 mt-1">Last updated: {lastUpdated}</p>
      </header>

      <nav className="flex gap-1 mb-6 border-b border-[#2a2d3e]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              tab === t.id
                ? 'bg-[#1a1d2e] text-white border border-b-0 border-[#2a2d3e]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded p-4 text-red-300 text-sm mb-4">
          Failed to load data: {error}
        </div>
      )}

      {tab === 'market' && (
        <>
          {!snapshots && !error && <div className="text-gray-400 text-sm">Loading…</div>}
          {latest && (
            <>
              <KpiStrip data={latest} />
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DayChangeChart data={latest} />
                <ReturnsChart data={latest} />
              </div>
            </>
          )}
        </>
      )}

      {tab === 'fx' && (
        <>
          {!fxSignals && !error && <div className="text-gray-400 text-sm">Loading…</div>}
          {latestFx && <FxSignalsView data={latestFx} />}
        </>
      )}

      {tab === 'movers' && (
        <>
          {!topMovers && !error && <div className="text-gray-400 text-sm">Loading…</div>}
          {latestMovers && <TopMoversTable data={latestMovers} />}
        </>
      )}

      {tab === 'regime' && (
        <>
          {!crossSignals && !error && <div className="text-gray-400 text-sm">Loading…</div>}
          {crossSignals && <RiskRegimeView data={crossSignals} />}
        </>
      )}
    </div>
  )
}
