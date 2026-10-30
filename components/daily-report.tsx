import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrandLogo } from '@/components/brand-logo'
import { KpiCard } from '@/components/kpi-card'
import { formatNumber, formatPercent, cn } from '@/lib/utils'
import { getBrand } from '@/lib/brand'
import type { DailyReport } from '@/lib/reports/build-daily'

export function DailyReportView({ report }: { report: DailyReport }) {
  const brand = getBrand()

  return (
    <article className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-brand-border pb-6">
        <div className="flex items-center gap-4">
          <BrandLogo width={40} height={40} showName={false} />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Daily report</h1>
            <p className="mt-1 text-brand-muted">
              {brand.name} · {report.date}
            </p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="Total impressions"
          value={report.total.impressions}
          delta={report.totalDelta}
          hint="vs prior day"
        />
        <KpiCard
          label="Engagement"
          value={report.total.engagement}
        />
        <KpiCard
          label="Engagement rate"
          value={report.total.engagementRate}
          format="percent"
        />
        <KpiCard label="Posts" value={report.total.posts} />
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>By platform</CardTitle>
            <CardDescription>Yesterday vs prior day</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-border text-left text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="py-2 pr-3 font-medium">Platform</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium text-right">Impressions</th>
                <th className="py-2 pr-3 font-medium text-right">Δ vs prior</th>
                <th className="py-2 pr-3 font-medium text-right">Engagement</th>
                <th className="py-2 pr-3 font-medium text-right">Posts</th>
                <th className="py-2 font-medium text-right">Followers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {report.rows.map((r) => (
                <tr key={r.meta.id}>
                  <td className="py-3 pr-3 font-medium">{r.meta.name}</td>
                  <td className="py-3 pr-3">
                    <Badge tone={r.source === 'live' ? 'live' : 'demo'}>
                      {r.source === 'live' ? 'LIVE' : 'DEMO'}
                    </Badge>
                  </td>
                  <td className="py-3 pr-3 text-right">{formatNumber(r.yesterday.impressions)}</td>
                  <td className="py-3 pr-3 text-right">
                    <DeltaInline delta={r.delta} />
                  </td>
                  <td className="py-3 pr-3 text-right">{formatNumber(r.yesterday.engagement)}</td>
                  <td className="py-3 pr-3 text-right">{r.yesterday.posts}</td>
                  <td className="py-3 text-right">{formatNumber(r.yesterday.followers)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <footer className="border-t border-brand-border pt-4 text-xs text-brand-muted">
        {brand.reportFooter}
      </footer>
    </article>
  )
}

function DeltaInline({ delta }: { delta: { pct: number; dir: 'up' | 'down' | 'flat' } }) {
  const Icon = delta.dir === 'up' ? ArrowUpRight : delta.dir === 'down' ? ArrowDownRight : Minus
  const tone =
    delta.dir === 'up' ? 'text-success' : delta.dir === 'down' ? 'text-danger' : 'text-brand-muted'
  return (
    <span className={cn('inline-flex items-center justify-end gap-1 font-medium', tone)}>
      <Icon className="h-3.5 w-3.5" />
      {formatPercent(Math.abs(delta.pct))}
    </span>
  )
}
