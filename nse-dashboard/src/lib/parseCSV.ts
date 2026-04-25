'use client'

import Papa from 'papaparse'
import { Deal } from './types'

let dealsPromise: Promise<Deal[]> | null = null

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthMap: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
}

function parseDate(rawDate: string): Date {
  const trimmed = rawDate.trim()
  const parts = trimmed.split('-')
  if (parts.length === 3) {
    const [day, mon, year] = parts
    const monthIndex = monthMap[mon.toUpperCase()]
    const dayNum = Number(day)
    const yearNum = Number(year)
    if (Number.isFinite(dayNum) && Number.isFinite(yearNum) && monthIndex !== undefined) {
      return new Date(yearNum, monthIndex, dayNum)
    }
  }

  const fallback = new Date(trimmed)
  return Number.isNaN(fallback.getTime()) ? new Date(0) : fallback
}

function normalizeRow(row: Record<string, string>): Record<string, string> {
  return Object.entries(row).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key.trim()] = typeof value === 'string' ? value.trim() : value
    return acc
  }, {})
}

function pick(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim()
    }
  }
  return ''
}

export async function loadDeals(): Promise<Deal[]> {
  if (dealsPromise) return dealsPromise

  dealsPromise = (async () => {
    const res = await fetch('/Bulk-Deals-24-04-2025-to-24-04-2026.csv')
    const text = await res.text()
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })

    return (data as Record<string, string>[])
      .map((rawRow) => {
        const row = normalizeRow(rawRow)

        const qtyRaw = pick(row, ['Quantity Traded', 'Quantity'])
        const priceRaw = pick(row, ['Trade Price / Wght. Avg. Price', 'Trade_Price'])
        const dateRaw = pick(row, ['Date'])
        const symbolRaw = pick(row, ['Symbol'])
        const securityRaw = pick(row, ['Security Name', 'Security_Name'])
        const clientRaw = pick(row, ['Client Name', 'Client_Name'])
        const typeRaw = pick(row, ['Buy / Sell', 'Buy_Sell'])

        const qty = parseFloat(qtyRaw.replace(/,/g, ''))
        const price = parseFloat(priceRaw.replace(/,/g, ''))
        const date = parseDate(dateRaw)

        const buySell = typeRaw.toUpperCase() as 'BUY' | 'SELL'
        const qtyClean = Number.isNaN(qty) ? 0 : qty
        const priceClean = Number.isNaN(price) ? 0 : price

        return {
          date,
          dateStr: `${monthNames[date.getMonth()] ?? 'Jan'} ${date.getFullYear()}`,
          symbol: symbolRaw,
          securityName: securityRaw,
          clientName: clientRaw,
          buySell,
          quantity: qtyClean,
          tradePrice: priceClean,
          dealValue: qtyClean * priceClean,
          month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        } satisfies Deal
      })
      .filter(
        (d) =>
          d.symbol &&
          d.tradePrice > 0 &&
          d.quantity > 0 &&
          (d.buySell === 'BUY' || d.buySell === 'SELL') &&
          !Number.isNaN(d.date.getTime()),
      )
  })()

  return dealsPromise
}