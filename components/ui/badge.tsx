import * as React from 'react'
import { cn } from '@/lib/utils'

type Tone = 'default' | 'success' | 'danger' | 'demo' | 'live'

const toneClasses: Record<Tone, string> = {
  default: 'bg-brand-border/40 text-brand-fg',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  demo: 'bg-brand-accent/15 text-brand-accent',
  live: 'bg-success/15 text-success',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
