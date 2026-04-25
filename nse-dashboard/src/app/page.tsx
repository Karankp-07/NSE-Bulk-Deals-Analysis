'use client'

import { useEffect, useState } from 'react'
import DealsTable from '@/components/DealsTable'
import Header from '@/components/Header'
import KpiCards from '@/components/KpiCards'
import MonthlyChart from '@/components/MonthlyChart'
import StockInsights from '@/components/StockInsights'
import TopClientsChart from '@/components/TopClientsChart'
import TopStocksChart from '@/components/TopStocksChart'
import { Skeleton } from '@/components/ui/skeleton'
import { loadDeals } from '@/lib/parseCSV'
import { loadEventStudy } from '@/lib/parseEventStudy'
import { Deal, EventStudyRecord } from '@/lib/types'

export default function Page() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [eventRows, setEventRows] = useState<EventStudyRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadDeals(), loadEventStudy()])
      .then(([parsedDeals, parsedEvents]) => {
        setDeals(parsedDeals)
        setEventRows(parsedEvents)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header dealsCount={deals.length} />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <KpiCards deals={deals} />
        <MonthlyChart deals={deals} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopStocksChart deals={deals} />
          <TopClientsChart deals={deals} />
        </div>
        <StockInsights events={eventRows} />
        <DealsTable deals={deals} />
      </div>
    </main>
  )
}
