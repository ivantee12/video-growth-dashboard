import { subDays, startOfDay, endOfDay } from 'date-fns'
import type { DateRange } from '@/lib/adapters/types'

export function lastNDays(n: number, ref = new Date()): DateRange {
  return {
    start: startOfDay(subDays(ref, n - 1)),
    end: endOfDay(ref),
  }
}

export function yesterdayRange(ref = new Date()): DateRange {
  const y = subDays(ref, 1)
  return { start: startOfDay(y), end: endOfDay(y) }
}

export function priorDayRange(ref = new Date()): DateRange {
  const p = subDays(ref, 2)
  return { start: startOfDay(p), end: endOfDay(p) }
}
