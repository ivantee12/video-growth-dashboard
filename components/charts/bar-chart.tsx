'use client'

import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumber } from '@/lib/utils'

interface BarChartProps {
  data: Array<Record<string, number | string>>
  xKey: string
  yKey: string
  yLabel?: string
  color?: string
  height?: number
}

export function BarChart({
  data,
  xKey,
  yKey,
  yLabel,
  color = 'rgb(var(--brand-primary))',
  height = 240,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgb(var(--brand-border))" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xKey}
          stroke="rgb(var(--brand-muted))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgb(var(--brand-muted))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatNumber(v)}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: 'rgb(var(--brand-surface))',
            border: '1px solid rgb(var(--brand-border))',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v: number) => [formatNumber(v), yLabel ?? yKey]}
        />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </RBarChart>
    </ResponsiveContainer>
  )
}
