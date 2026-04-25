'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Deal } from '@/lib/types'

interface Props {
  deals: Deal[]
}

export default function TopStocksChart({ deals }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, number>()
    deals.forEach((d) => map.set(d.symbol, (map.get(d.symbol) ?? 0) + 1))
    return [...map.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([symbol, count]) => ({ symbol, count }))
  }, [deals])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Top 15 Most Traded Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="symbol" tick={{ fontSize: 11 }} width={55} />
            <Tooltip
              contentStyle={{
                background: 'rgb(255 255 255)',
                border: '1px solid rgb(203 213 225)',
                borderRadius: '0.5rem',
                color: '#0f172a',
              }}
            />
            <Bar dataKey="count" name="Deals" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={`hsl(${206 + i * 3}, 58%, ${63 - i * 1.2}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
