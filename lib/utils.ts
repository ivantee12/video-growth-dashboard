import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString()
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`
}

export function formatDelta(curr: number, prev: number): { pct: number; dir: 'up' | 'down' | 'flat' } {
  if (prev === 0) return { pct: 0, dir: 'flat' }
  const pct = ((curr - prev) / prev) * 100
  const dir = pct > 0.05 ? 'up' : pct < -0.05 ? 'down' : 'flat'
  return { pct, dir }
}
