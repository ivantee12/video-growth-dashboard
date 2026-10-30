'use client'

import { useEffect, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'livedashboard:brand-preview'

interface PreviewState {
  primary: string
  accent: string
}

function readStorage(): PreviewState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PreviewState) : null
  } catch {
    return null
  }
}

function hexToRgbTriplet(hex: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const v = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1]
  return `${parseInt(v.slice(0, 2), 16)} ${parseInt(v.slice(2, 4), 16)} ${parseInt(v.slice(4, 6), 16)}`
}

function applyVars(state: PreviewState | null) {
  const root = document.documentElement
  if (!state) {
    root.style.removeProperty('--brand-primary')
    root.style.removeProperty('--brand-accent')
    return
  }
  const p = hexToRgbTriplet(state.primary)
  const a = hexToRgbTriplet(state.accent)
  if (p) root.style.setProperty('--brand-primary', p)
  if (a) root.style.setProperty('--brand-accent', a)
}

interface BrandingPanelProps {
  defaultPrimary: string
  defaultAccent: string
}

export function BrandingPanel({ defaultPrimary, defaultAccent }: BrandingPanelProps) {
  const [primary, setPrimary] = useState(defaultPrimary)
  const [accent, setAccent] = useState(defaultAccent)

  useEffect(() => {
    const stored = readStorage()
    if (stored) {
      setPrimary(stored.primary)
      setAccent(stored.accent)
      applyVars(stored)
    }
  }, [])

  function preview() {
    const next = { primary, accent }
    applyVars(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY)
    applyVars(null)
    setPrimary(defaultPrimary)
    setAccent(defaultAccent)
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Branding preview</CardTitle>
          <CardDescription>
            Try out brand colors before committing them in <code className="text-brand-fg">brand.config.ts</code>.
            Changes here only affect your browser.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorRow label="Primary color" value={primary} onChange={setPrimary} />
        <ColorRow label="Accent color" value={accent} onChange={setAccent} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button onClick={preview}>Preview</Button>
        <Button variant="secondary" onClick={reset}>Reset</Button>
        <p className="text-xs text-brand-muted">
          To make these permanent for everyone, edit <code className="text-brand-fg">brand.config.ts</code> and redeploy.
        </p>
      </div>
    </Card>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-brand-muted">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border border-brand-border bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-brand-border bg-brand-bg px-3 font-mono text-sm focus:border-brand-primary focus:outline-none"
        />
      </div>
    </label>
  )
}
