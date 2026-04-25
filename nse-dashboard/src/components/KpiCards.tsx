import { ArrowUpDown, BarChart2, Building2, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Deal } from '@/lib/types'
import { formatIndian } from '@/lib/utils'

interface Props {
  deals: Deal[]
}

export default function KpiCards({ deals }: Props) {
  const buyCount = deals.filter((d) => d.buySell === 'BUY').length
  const sellCount = deals.filter((d) => d.buySell === 'SELL').length
  const uniqueSymbols = new Set(deals.map((d) => d.symbol)).size
  const uniqueClients = new Set(deals.map((d) => d.clientName)).size
  const buyPct = ((buyCount / deals.length) * 100).toFixed(1)
  const sellPct = ((sellCount / deals.length) * 100).toFixed(1)

  const cards = [
    {
      label: 'Total Deals',
      value: formatIndian(deals.length),
      icon: BarChart2,
      color: 'border-l-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-300',
    },
    {
      label: 'Unique Stocks',
      value: formatIndian(uniqueSymbols),
      icon: Building2,
      color: 'border-l-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-950',
      iconColor: 'text-violet-600 dark:text-violet-300',
    },
    {
      label: 'Unique Clients',
      value: formatIndian(uniqueClients),
      icon: Users,
      color: 'border-l-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950',
      iconColor: 'text-amber-600 dark:text-amber-300',
    },
    {
      label: 'Buy / Sell Ratio',
      value: `${buyPct}% / ${sellPct}%`,
      icon: ArrowUpDown,
      color: 'border-l-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      iconColor: 'text-emerald-600 dark:text-emerald-300',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className={`border-l-4 ${c.color}`}>
          <CardContent className="pb-4 pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{c.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}