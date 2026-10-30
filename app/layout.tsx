import type { Metadata } from 'next'
import { brandCssVars, getBrand } from '@/lib/brand'
import { Nav } from '@/components/nav'
import './globals.css'

const brand = getBrand()

export const metadata: Metadata = {
  title: { default: brand.name, template: `%s | ${brand.name}` },
  description: brand.tagline,
  icons: { icon: brand.favicon },
  openGraph: {
    title: brand.name,
    description: brand.tagline,
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const styleVars = brandCssVars() as React.CSSProperties
  return (
    <html lang="en" className="dark">
      <body style={styleVars} className="min-h-screen bg-brand-bg text-brand-fg">
        <Nav />
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
