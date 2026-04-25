'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Deal } from '@/lib/types'

interface Props {
  deals: Deal[]
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { fullName: string } }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="max-w-[220px] rounded border border-slate-300 bg-white p-2 text-xs shadow-lg">
        <p className="font-semibold text-slate-900">{payload[0].payload.fullName}</p>
        <p className="text-emerald-700">{payload[0].value} deals</p>
      </div>
    )
  }
  return null
}

export default function TopClientsChart({ deals }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, number>()
    deals
      .filter((d) => d.buySell === 'BUY')
      .forEach((d) => {
        map.set(d.clientName, (map.get(d.clientName) ?? 0) + 1)
      })

    return [...map.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([client, count]) => ({
        client: client.length > 22 ? `${client.slice(0, 22)}...` : client,
        fullName: client,
        count,
      }))
  }, [deals])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Top 10 Most Active Buyers</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 54, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" />
            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 'dataMax + 40']} />
            <YAxis type="category" dataKey="client" tick={{ fontSize: 10 }} width={96} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Deals" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}