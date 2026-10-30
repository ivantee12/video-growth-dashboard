import { brand as fileConfig, type BrandConfig } from '@/brand.config'

function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

export function getBrand(): BrandConfig {
  return {
    ...fileConfig,
    name: process.env.BRAND_NAME ?? fileConfig.name,
    colors: {
      ...fileConfig.colors,
      primary: process.env.BRAND_PRIMARY ?? fileConfig.colors.primary,
      accent: process.env.BRAND_ACCENT ?? fileConfig.colors.accent,
    },
  }
}

export function brandCssVars(): Record<string, string> {
  const b = getBrand()
  return {
    '--brand-primary': hexToRgbTriplet(b.colors.primary),
    '--brand-accent': hexToRgbTriplet(b.colors.accent),
    '--brand-bg': hexToRgbTriplet(b.colors.bg),
    '--brand-surface': hexToRgbTriplet(b.colors.surface),
    '--brand-border': hexToRgbTriplet(b.colors.border),
    '--brand-fg': hexToRgbTriplet(b.colors.fg),
    '--brand-muted': hexToRgbTriplet(b.colors.muted),
  }
}
