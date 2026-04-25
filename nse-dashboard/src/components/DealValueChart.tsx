'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Deal } from '@/lib/types'

interface Props {
  deals: Deal[]
}

function logBin(value: number): string {
  if (value <= 0) return '<1L'
  const log = Math.floor(Math.log10(value / 100000))
  const labels = ['<1L', '1L-10L', '10L-1Cr', '1Cr-10Cr', '10Cr-100Cr', '>100Cr']
  return labels[Math.min(Math.max(log + 1, 0), labels.length - 1)]
}

const binOrder = ['<1L', '1L-10L', '10L-1Cr', '1Cr-10Cr', '10Cr-100Cr', '>100Cr']

export default function DealValueChart({ deals }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, { bin: string; buy: number; sell: number }>()
    binOrder.forEach((b) => map.set(b, { bin: b, buy: 0, sell: 0 }))
    deals.forEach((d) => {
      const bin = logBin(d.dealValue)
      const entry = map.get(bin)
      if (!entry) return
      if (d.buySell === 'BUY') entry.buy += 1
      else entry.sell += 1
    })
    return binOrder.map((b) => map.get(b)!).filter(Boolean)
  }, [deals])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Deal Value Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: 'rgb(15 23 42)',
                border: '1px solid rgb(51 65 85)',
                borderRadius: '0.5rem',
                color: 'white',
              }}
            />
            <Legend />
            <Bar dataKey="buy" name="BUY" fill="#10b981" opacity={0.85} radius={[4, 4, 0, 0]} />
            <Bar dataKey="sell" name="SELL" fill="#f43f5e" opacity={0.85} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}