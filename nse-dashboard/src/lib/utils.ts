import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCrore(value: number): string {
  const crore = value / 1e7
  if (crore >= 1000) return `₹${(crore / 1000).toFixed(1)}K Cr`
  if (crore >= 1) return `₹${crore.toFixed(1)} Cr`
  return `₹${(value / 1e5).toFixed(1)} L`
}

export function formatIndian(n: number): string {
  return n.toLocaleString('en-IN')
}

export function getTypeBadgeClass(type: 'BUY' | 'SELL') {
  return type === 'BUY'
    ? 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
    : 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
}