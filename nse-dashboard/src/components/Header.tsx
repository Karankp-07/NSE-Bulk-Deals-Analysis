'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatIndian } from '@/lib/utils'

interface HeaderProps {
  dealsCount: number
}

export default function Header({ dealsCount }: HeaderProps) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = window.localStorage.getItem('nse-dashboard-theme')
    const root = document.documentElement

    if (saved === 'dark') {
      root.classList.add('dark')
      setDark(true)
      return
    }

    if (saved === 'light') {
      root.classList.remove('dark')
      setDark(false)
      return
    }

    root.classList.add('dark')
    setDark(true)
    window.localStorage.setItem('nse-dashboard-theme', 'dark')
  }, [])

  function toggleTheme() {
    const root = document.documentElement
    const nextDark = !root.classList.contains('dark')
    root.classList.toggle('dark', nextDark)
    setDark(nextDark)
    window.localStorage.setItem('nse-dashboard-theme', nextDark ? 'dark' : 'light')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-900/50">
            <TrendingUp className="h-5 w-5 text-sky-700 dark:text-sky-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-slate-900 dark:text-white">NSE Bulk Deal Signal Analysis</h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Apr 2025 - Apr 2026 · {formatIndian(dealsCount)} transactions · Event Study
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  )
}