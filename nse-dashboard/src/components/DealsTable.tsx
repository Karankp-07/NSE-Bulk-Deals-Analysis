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
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL')
  const [symbolFilter, setSymbolFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const topSymbols = useMemo(() => {
    const map = new Map<string, number>()
    deals.forEach((d) => map.set(d.symbol, (map.get(d.symbol) ?? 0) + 1))
    return [...map.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([symbol]) => symbol)
  }, [deals])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return deals.filter((d) => {
      const textPass =
        !q ||
        d.symbol.toLowerCase().includes(q) ||
        d.securityName.toLowerCase().includes(q) ||
        d.clientName.toLowerCase().includes(q)
      const typePass = typeFilter === 'ALL' || d.buySell === typeFilter
      const symbolPass = symbolFilter === 'ALL' || d.symbol === symbolFilter
      return textPass && typePass && symbolPass
    })
  }, [deals, search, typeFilter, symbolFilter])

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
              onChange={(e) => updateAndResetPage(setSearch, e.target.value)}
              className="pl-9"
              placeholder="Search Symbol, Company, Client"
            />
          </div>

          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={typeFilter}
            onChange={(e) => updateAndResetPage(setTypeFilter, e.target.value as 'ALL' | 'BUY' | 'SELL')}
          >
            <option value="ALL">All Types</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>

          <div>
            <Input
              list="symbol-list"
              placeholder="Filter Symbol (top 50, searchable)"
              value={symbolFilter === 'ALL' ? '' : symbolFilter}
              onChange={(e) => {
                const value = e.target.value.trim().toUpperCase()
                if (!value) updateAndResetPage(setSymbolFilter, 'ALL')
                else updateAndResetPage(setSymbolFilter, value)
              }}
            />
            <datalist id="symbol-list">
              {topSymbols.map((symbol) => (
                <option key={symbol} value={symbol} />
              ))}
            </datalist>
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