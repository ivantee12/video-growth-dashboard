import { getAllAdapters } from '@/lib/adapters'
import { yesterdayRange, priorDayRange } from '@/lib/date'
import { aggregateOverview } from '@/lib/metrics/aggregate'
import { formatDelta } from '@/lib/utils'
import type { OverviewMetrics, PlatformMeta } from '@/lib/adapters/types'

export interface DailyReportRow {
  meta: PlatformMeta
  source: 'mock' | 'live'
  yesterday: OverviewMetrics
  prior: OverviewMetrics
  delta: { pct: number; dir: 'up' | 'down' | 'flat' }
}

export interface DailyReport {
  date: string
  total: ReturnType<typeof aggregateOverview>
  totalPrior: ReturnType<typeof aggregateOverview>
  totalDelta: { pct: number; dir: 'up' | 'down' | 'flat' }
  rows: DailyReportRow[]
}

export async function buildDailyReport(ref: Date = new Date()): Promise<DailyReport> {
  const yRange = yesterdayRange(ref)
  const pRange = priorDayRange(ref)
  const adapters = getAllAdapters()

  const [yesterdays, priors] = await Promise.all([
    Promise.all(adapters.map((a) => a.getOverview(yRange))),
    Promise.all(adapters.map((a) => a.getOverview(pRange))),
  ])

  const rows: DailyReportRow[] = adapters.map((a, i) => ({
    meta: a.meta,
    source: a.source,
    yesterday: yesterdays[i],
    prior: priors[i],
    delta: formatDelta(yesterdays[i].impressions, priors[i].impressions),
  }))

  const total = aggregateOverview(yesterdays)
  const totalPrior = aggregateOverview(priors)
  const totalDelta = formatDelta(total.impressions, totalPrior.impressions)

  return {
    date: yRange.start.toISOString().slice(0, 10),
    total,
    totalPrior,
    totalDelta,
    rows,
  }
}
