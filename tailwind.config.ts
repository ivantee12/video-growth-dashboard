import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          accent: 'rgb(var(--brand-accent) / <alpha-value>)',
          bg: 'rgb(var(--brand-bg) / <alpha-value>)',
          surface: 'rgb(var(--brand-surface) / <alpha-value>)',
          border: 'rgb(var(--brand-border) / <alpha-value>)',
          fg: 'rgb(var(--brand-fg) / <alpha-value>)',
          muted: 'rgb(var(--brand-muted) / <alpha-value>)',
        },
        success: 'rgb(34 197 94)',
        danger: 'rgb(239 68 68)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
}

export default config
