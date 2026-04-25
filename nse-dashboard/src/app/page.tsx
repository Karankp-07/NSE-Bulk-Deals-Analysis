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
  const [loadingDeals, setLoadingDeals] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    loadDeals()
      .then((parsedDeals) => {
        setDeals(parsedDeals)
      })
      .finally(() => {
        setLoadingDeals(false)
      })

    loadEventStudy()
      .then((parsedEvents) => {
        setEventRows(parsedEvents)
      })
      .finally(() => {
        setLoadingEvents(false)
      })
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header dealsCount={deals.length} />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {loadingDeals ? <Skeleton className="h-32 w-full" /> : <KpiCards deals={deals} />}
        {loadingDeals ? <Skeleton className="h-72 w-full" /> : <MonthlyChart deals={deals} />}
        {loadingDeals ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[380px] w-full" />
            <Skeleton className="h-[380px] w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopStocksChart deals={deals} />
            <TopClientsChart deals={deals} />
          </div>
        )}
        {loadingEvents ? <Skeleton className="h-[540px] w-full" /> : <StockInsights events={eventRows} />}
        {loadingDeals ? <Skeleton className="h-[620px] w-full" /> : <DealsTable deals={deals} />}
      </div>
    </main>
  )
}
