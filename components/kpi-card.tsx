import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn, formatNumber, formatPercent } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: number | string
  delta?: { pct: number; dir: 'up' | 'down' | 'flat' }
  hint?: string
  format?: 'number' | 'percent' | 'raw'
}

export function KpiCard({ label, value, delta, hint, format = 'number' }: KpiCardProps) {
  const display =
    typeof value === 'string'
      ? value
      : format === 'percent'
        ? formatPercent(value)
        : format === 'raw'
          ? value.toLocaleString()
          : formatNumber(value)

  return (
    <div className="card flex flex-col gap-1">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{display}</div>
      <div className="mt-1 flex items-center justify-between text-xs">
        {delta ? <DeltaPill delta={delta} /> : <span />}
        {hint && <span className="text-brand-muted">{hint}</span>}
      </div>
    </div>
  )
}

function DeltaPill({ delta }: { delta: { pct: number; dir: 'up' | 'down' | 'flat' } }) {
  const Icon = delta.dir === 'up' ? ArrowUpRight : delta.dir === 'down' ? ArrowDownRight : Minus
  const tone =
    delta.dir === 'up'
      ? 'text-success'
      : delta.dir === 'down'
        ? 'text-danger'
        : 'text-brand-muted'
  return (
    <span className={cn('inline-flex items-center gap-1 font-medium', tone)}>
      <Icon className="h-3.5 w-3.5" />
      {formatPercent(Math.abs(delta.pct))} vs prior
    </span>
  )
}
