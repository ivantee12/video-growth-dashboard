import Image from 'next/image'
import { getBrand } from '@/lib/brand'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  variant?: 'light' | 'dark'
  className?: string
  width?: number
  height?: number
  showName?: boolean
}

export function BrandLogo({
  variant = 'dark',
  className,
  width = 32,
  height = 32,
  showName = true,
}: BrandLogoProps) {
  const brand = getBrand()
  const src = variant === 'light' ? brand.logo.light : brand.logo.dark

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Image
        src={src}
        alt={`${brand.name} logo`}
        width={width}
        height={height}
        priority
        className="rounded"
      />
      {showName && (
        <span className="text-base font-semibold tracking-tight">{brand.name}</span>
      )}
    </div>
  )
}
