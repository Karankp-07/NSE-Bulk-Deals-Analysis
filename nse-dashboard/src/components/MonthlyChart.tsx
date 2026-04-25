'use client'

import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Deal } from '@/lib/types'

interface Props {
  deals: Deal[]
}

export default function MonthlyChart({ deals }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, { month: string; buy: number; sell: number }>()
    deals.forEach((d) => {
      if (!map.has(d.month)) {
        map.set(d.month, { month: d.dateStr, buy: 0, sell: 0 })
      }
      const entry = map.get(d.month)
      if (!entry) return
      if (d.buySell === 'BUY') entry.buy += 1
      else entry.sell += 1
    })

    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
  }, [deals])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Monthly Bulk Deal Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="buyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sellGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={45} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: 'rgb(255 255 255)',
                border: '1px solid rgb(203 213 225)',
                borderRadius: '0.5rem',
                color: '#0f172a',
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="buy" name="BUY" stroke="#10b981" fill="url(#buyGrad)" strokeWidth={2} dot={{ r: 3 }} />
            <Area type="monotone" dataKey="sell" name="SELL" stroke="#f43f5e" fill="url(#sellGrad)" strokeWidth={2} dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}