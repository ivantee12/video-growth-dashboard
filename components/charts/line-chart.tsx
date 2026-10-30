'use client'

import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumber } from '@/lib/utils'

interface Series {
  key: string
  label: string
  color: string
}

interface LineChartProps {
  data: readonly unknown[]
  xKey: string
  series: Series[]
  height?: number
}

export function LineChart({ data, xKey, series, height = 280 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data as Array<Record<string, number | string>>} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgb(var(--brand-border))" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xKey}
          stroke="rgb(var(--brand-muted))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => v.slice(5)}
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
          labelStyle={{ color: 'rgb(var(--brand-muted))' }}
          formatter={(v: number) => formatNumber(v)}
        />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </RLineChart>
    </ResponsiveContainer>
  )
}
