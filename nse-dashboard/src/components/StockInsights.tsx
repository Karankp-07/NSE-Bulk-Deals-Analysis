'use client'

import { useEffect, useMemo, useState } from 'react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EventStudyRecord } from '@/lib/types'

interface Props {
  events: EventStudyRecord[]
}

function mean(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function returnColor(value: number) {
  return value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
}

export default function StockInsights({ events }: Props) {
  const symbols = useMemo(() => Array.from(new Set(events.map((e) => e.symbol))).sort(), [events])
  const symbolCounts = useMemo(() => {
    const map = new Map<string, number>()
    events.forEach((e) => map.set(e.symbol, (map.get(e.symbol) ?? 0) + 1))
    return map
  }, [events])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  function handleSearchChange(value: string) {
    setSearchTerm(value)
    const next = value.trim().toUpperCase()
    if (!next) return

    const exact = symbols.find((s) => s === next)
    if (exact) {
      setSelectedSymbol(exact)
    }
  }

  const filteredSymbols = useMemo(() => {
    const q = searchTerm.trim().toUpperCase()
    const base = q ? symbols.filter((s) => s.includes(q)) : symbols
    return [...base].sort((a, b) => {
      const aStarts = q ? a.startsWith(q) : false
      const bStarts = q ? b.startsWith(q) : false
      if (aStarts !== bStarts) return aStarts ? -1 : 1
      const countDiff = (symbolCounts.get(b) ?? 0) - (symbolCounts.get(a) ?? 0)
      if (countDiff !== 0) return countDiff
      return a.localeCompare(b)
    })
  }, [searchTerm, symbols, symbolCounts])

  useEffect(() => {
    if (!selectedSymbol && filteredSymbols.length) {
      setSelectedSymbol(filteredSymbols[0])
      return
    }
    if (selectedSymbol && filteredSymbols.length && !filteredSymbols.includes(selectedSymbol)) {
      setSelectedSymbol(filteredSymbols[0])
    }
  }, [filteredSymbols, selectedSymbol])

  const selectedRows = useMemo(() => {
    return events
      .filter((e) => e.symbol === selectedSymbol)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [events, selectedSymbol])

  const prediction = useMemo(() => {
    const r1 = mean(selectedRows.map((r) => r.return1D))
    const r5 = mean(selectedRows.map((r) => r.return5D))
    const r10 = mean(selectedRows.map((r) => r.return10D))
    const r30 = mean(selectedRows.map((r) => r.return30D))
    const positive = selectedRows.filter((r) => r.label === 1).length
    const confidence = selectedRows.length ? (positive / selectedRows.length) * 100 : 0
    return { r1, r5, r10, r30, confidence }
  }, [selectedRows])

  const history = useMemo(
    () =>
      selectedRows.slice(-120).map((r) => ({
        date: r.date.toLocaleDateString('en-IN'),
        return30D: Number(r.return30D.toFixed(2)),
      })),
    [selectedRows],
  )

  const trendStroke = prediction.r30 >= 0 ? '#16a34a' : '#e11d48'
  const trendCardTone =
    prediction.r30 >= 0
      ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/70 dark:from-emerald-950/40 dark:to-slate-950'
      : 'border-rose-200 bg-gradient-to-br from-rose-50 to-white dark:border-rose-900/70 dark:from-rose-950/40 dark:to-slate-950'

  const trendPanelTone =
    prediction.r30 >= 0
      ? 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20'
      : 'border-rose-200/80 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/20'

  return (
    <Card className={trendCardTone}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Stock Return Prediction & History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Input
              value={searchTerm}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
              onChange={(e) => {
                setSearchOpen(true)
                handleSearchChange(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredSymbols.length) {
                  const next = filteredSymbols[0]
                  setSelectedSymbol(next)
                  setSearchTerm(next)
                  setSearchOpen(false)
                }
              }}
              placeholder="Search stock symbol (e.g. APOLLO, GUJALKALI)"
              className="lg:col-span-2"
            />
            {searchOpen && filteredSymbols.length > 0 ? (
              <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {filteredSymbols.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    onMouseDown={() => {
                      setSelectedSymbol(symbol)
                      setSearchTerm(symbol)
                      setSearchOpen(false)
                    }}
                  >
                    <span className="font-medium">{symbol}</span>
                    <span className="text-xs text-slate-500">{symbolCounts.get(symbol) ?? 0}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 lg:col-span-2">
            Selected Stock: <span className="ml-1 font-semibold">{selectedSymbol || 'None'}</span>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/60">
            Samples: <span className="font-semibold">{selectedRows.length}</span>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/60">
            Positive Rate: <span className="font-semibold">{prediction.confidence.toFixed(1)}%</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredSymbols.length} of {symbols.length} stocks
        </p>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-slate-500">Predicted 1D</p>
            <p className={`text-lg font-semibold ${returnColor(prediction.r1)}`}>{prediction.r1.toFixed(2)}%</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-slate-500">Predicted 5D</p>
            <p className={`text-lg font-semibold ${returnColor(prediction.r5)}`}>{prediction.r5.toFixed(2)}%</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-slate-500">Predicted 10D</p>
            <p className={`text-lg font-semibold ${returnColor(prediction.r10)}`}>{prediction.r10.toFixed(2)}%</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-slate-500">Predicted 30D</p>
            <p className={`text-lg font-semibold ${returnColor(prediction.r30)}`}>{prediction.r30.toFixed(2)}%</p>
          </div>
        </div>

        <div className={`rounded-md border p-3 ${trendPanelTone}`}>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Historical 30D Return Trend (Latest 120 events)</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={20} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{
                  background: 'rgb(248 250 252)',
                  border: '1px solid rgb(203 213 225)',
                  borderRadius: '0.5rem',
                  color: '#0f172a',
                }}
              />
              <Line type="monotone" dataKey="return30D" stroke={trendStroke} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}