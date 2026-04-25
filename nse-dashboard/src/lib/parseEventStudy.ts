'use client'

import Papa from 'papaparse'
import { EventStudyRecord } from './types'

let eventStudyPromise: Promise<EventStudyRecord[]> | null = null

function asNumber(value: string): number {
  const parsed = parseFloat((value ?? '').replace(/,/g, ''))
  return Number.isNaN(parsed) ? 0 : parsed
}

export async function loadEventStudy(): Promise<EventStudyRecord[]> {
  if (eventStudyPromise) return eventStudyPromise

  eventStudyPromise = (async () => {
    const res = await fetch('/event_study.csv')
    const text = await res.text()
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })

    return (data as Record<string, string>[])
      .map((row) => {
        const date = new Date((row.Date ?? '').trim())
        return {
          date,
          symbol: (row.Symbol ?? '').trim(),
          return1D: asNumber(row.Return_1D ?? ''),
          return5D: asNumber(row.Return_5D ?? ''),
          return10D: asNumber(row.Return_10D ?? ''),
          return30D: asNumber(row.Return_30D ?? ''),
          label: Number(row.Label ?? 0) === 1 ? 1 : 0,
        } satisfies EventStudyRecord
      })
      .filter((r) => r.symbol && !Number.isNaN(r.date.getTime()))
  })()

  return eventStudyPromise
}