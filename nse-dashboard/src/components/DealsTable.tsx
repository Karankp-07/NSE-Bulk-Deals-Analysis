'use client'

import { useMemo, useState } from 'react'
import { ArrowDownUp, ArrowUp, ArrowDown, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Deal } from '@/lib/types'
import { formatCrore, formatIndian, getTypeBadgeClass } from '@/lib/utils'

interface Props {
  deals: Deal[]
}

type SortKey = 'date' | 'symbol' | 'securityName' | 'clientName' | 'buySell' | 'quantity' | 'tradePrice' | 'dealValue'
type SortDirection = 'asc' | 'desc'

const PAGE_SIZE = 20

export default function DealsTable({ deals }: Props) {
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('ALL')
  const [searchOpen, setSearchOpen] = useState(false)
  const [quickFilterOpen, setQuickFilterOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const topSymbols = useMemo(() => {
    const map = new Map<string, number>()
    deals.forEach((d) => map.set(d.symbol, (map.get(d.symbol) ?? 0) + 1))
    return [...map.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 100)
      .map(([symbol]) => symbol)
  }, [deals])

  const searchSymbols = useMemo(() => {
    const map = new Map<string, number>()
    deals.forEach((d) => map.set(d.symbol, (map.get(d.symbol) ?? 0) + 1))
    return [...map.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 150)
      .map(([symbol]) => symbol)
  }, [deals])

  const quickFilterOptions = useMemo(() => ['ALL', 'TYPE: BUY', 'TYPE: SELL', ...topSymbols], [topSymbols])

  const searchSuggestions = useMemo(() => {
    const q = search.trim().toUpperCase()
    if (!q) return searchSymbols

    return searchSymbols
      .filter((symbol) => symbol.includes(q))
      .sort((a, b) => {
        const aStarts = a.startsWith(q)
        const bStarts = b.startsWith(q)
        if (aStarts !== bStarts) return aStarts ? -1 : 1
        return a.localeCompare(b)
      })
  }, [search, searchSymbols])

  const quickFilterSuggestions = useMemo(() => {
    const q = quickFilter.trim().toUpperCase()
    const source = quickFilterOptions
    if (!q || q === 'ALL') return source

    return source
      .filter((option) => option.includes(q))
      .sort((a, b) => {
        const aStarts = a.startsWith(q)
        const bStarts = b.startsWith(q)
        if (aStarts !== bStarts) return aStarts ? -1 : 1
        return a.localeCompare(b)
      })
  }, [quickFilter, quickFilterOptions])

  const parsedQuickFilter = useMemo(() => {
    const raw = quickFilter.trim().toUpperCase()
    if (!raw || raw === 'ALL') {
      return { type: 'ALL' as 'ALL' | 'BUY' | 'SELL', symbolQuery: '' }
    }

    if (raw === 'BUY' || raw === 'SELL') {
      return { type: raw as 'BUY' | 'SELL', symbolQuery: '' }
    }

    if (raw.startsWith('TYPE: ')) {
      const candidate = raw.replace('TYPE: ', '').trim()
      if (candidate === 'BUY' || candidate === 'SELL') {
        return { type: candidate as 'BUY' | 'SELL', symbolQuery: '' }
      }
    }

    return { type: 'ALL' as 'ALL' | 'BUY' | 'SELL', symbolQuery: raw }
  }, [quickFilter])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return deals.filter((d) => {
      const textPass =
        !q ||
        d.symbol.toLowerCase().includes(q) ||
        d.securityName.toLowerCase().includes(q) ||
        d.clientName.toLowerCase().includes(q)
      const typePass = parsedQuickFilter.type === 'ALL' || d.buySell === parsedQuickFilter.type
      const symbolPass = !parsedQuickFilter.symbolQuery || d.symbol.includes(parsedQuickFilter.symbolQuery)
      return textPass && typePass && symbolPass
    })
  }, [deals, search, parsedQuickFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      const mult = sortDirection === 'asc' ? 1 : -1
      if (sortKey === 'date') return (a.date.getTime() - b.date.getTime()) * mult
      if (sortKey === 'quantity' || sortKey === 'tradePrice' || sortKey === 'dealValue') {
        return (a[sortKey] - b[sortKey]) * mult
      }
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * mult
    })
    return arr
  }, [filtered, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function updateAndResetPage<T>(setter: (value: T) => void, value: T) {
    setter(value)
    setCurrentPage(1)
  }

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(nextKey)
      setSortDirection('asc')
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowDownUp className="h-3.5 w-3.5" />
    return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Bulk Deals Table</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
              onChange={(e) => {
                setSearchOpen(true)
                updateAndResetPage(setSearch, e.target.value)
              }}
              className="pl-9"
              placeholder="Search Symbol, Company, Client"
            />
            {searchOpen && searchSuggestions.length > 0 ? (
              <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {searchSuggestions.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    onMouseDown={() => {
                      updateAndResetPage(setSearch, symbol)
                      setSearchOpen(false)
                    }}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <Input
              onFocus={() => setQuickFilterOpen(true)}
              onBlur={() => setTimeout(() => setQuickFilterOpen(false), 120)}
              placeholder="Quick Filter: TYPE: BUY, TYPE: SELL, or symbol"
              value={quickFilter === 'ALL' ? '' : quickFilter}
              onChange={(e) => {
                const value = e.target.value.trim().toUpperCase()
                setQuickFilterOpen(true)
                if (!value) updateAndResetPage(setQuickFilter, 'ALL')
                else updateAndResetPage(setQuickFilter, value)
              }}
            />
            {quickFilterOpen && quickFilterSuggestions.length > 0 ? (
              <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {quickFilterSuggestions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    onMouseDown={() => {
                      updateAndResetPage(setQuickFilter, option)
                      setQuickFilterOpen(false)
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('date')}>
                    Date <SortIcon column="date" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('symbol')}>
                    Symbol <SortIcon column="symbol" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('securityName')}>
                    Company <SortIcon column="securityName" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('clientName')}>
                    Client <SortIcon column="clientName" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('buySell')}>
                    Type <SortIcon column="buySell" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('quantity')}>
                    Quantity <SortIcon column="quantity" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('tradePrice')}>
                    Price (INR) <SortIcon column="tradePrice" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('dealValue')}>
                    Deal Value <SortIcon column="dealValue" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-slate-500 dark:text-slate-400">
                    No deals match current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((deal, i) => (
                  <TableRow
                    key={`${deal.symbol}-${deal.clientName}-${deal.date.getTime()}-${i}`}
                    className={
                      deal.buySell === 'BUY'
                        ? 'bg-[#f0fdf4] hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50'
                        : 'bg-[#fff1f2] hover:bg-rose-50 dark:bg-rose-950/30 dark:hover:bg-rose-950/50'
                    }
                  >
                    <TableCell>{deal.date.toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="font-semibold">{deal.symbol}</TableCell>
                    <TableCell className="max-w-[240px] truncate" title={deal.securityName}>
                      {deal.securityName}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate" title={deal.clientName}>
                      {deal.clientName}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeBadgeClass(deal.buySell)}>{deal.buySell}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatIndian(deal.quantity)}</TableCell>
                    <TableCell className="text-right tabular-nums">{`₹${deal.tradePrice.toFixed(2)}`}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCrore(deal.dealValue)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {(safePage - 1) * PAGE_SIZE + (paginated.length ? 1 : 0)}-
            {(safePage - 1) * PAGE_SIZE + paginated.length} of {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
              Previous
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Page {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}