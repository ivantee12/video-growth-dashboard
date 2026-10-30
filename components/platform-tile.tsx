import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/utils'
import type { OverviewMetrics, PlatformMeta } from '@/lib/adapters/types'

interface PlatformTileProps {
  meta: PlatformMeta
  overview: OverviewMetrics
  source: 'mock' | 'live'
}

export function PlatformTile({ meta, overview, source }: PlatformTileProps) {
  return (
    <Link
      href={`/platform/${meta.id}`}
      className="card group flex flex-col gap-4 transition-colors hover:border-brand-primary/60"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-brand-muted">{meta.metricLabel.primary}</div>
          <div className="mt-1 text-xl font-semibold tracking-tight">{meta.name}</div>
        </div>
        <Badge tone={source === 'live' ? 'live' : 'demo'}>
          {source === 'live' ? 'LIVE' : 'DEMO'}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Followers" value={overview.followers} />
        <Metric label="Impressions" value={overview.impressions} />
        <Metric label="Engagement" value={overview.engagement} />
      </div>
      <div className="mt-auto flex items-center justify-between text-sm text-brand-muted">
        <span>{overview.posts} posts</span>
        <span className="inline-flex items-center gap-1 text-brand-primary group-hover:gap-2 transition-all">
          View details <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xs text-brand-muted">{label}</div>
      <div className="mt-0.5 text-base font-semibold">{formatNumber(value)}</div>
    </div>
  )
}
