import Link from 'next/link'
import Image from 'next/image'
export function Nav() {
  return <nav className="border-b border-brand-border bg-brand-surface"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-5">
    <Link href="/" className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight"><Image src="/brand/video-growth.svg" width={32} height={32} alt="Video Growth logo"/>Video Growth <span className="text-xs font-normal text-brand-muted">LOCAL WORKSPACE</span></Link>
    <div className="flex gap-4 text-sm"><Link href="/">Dashboard</Link><Link href="/settings">Connections</Link></div>
  </div></nav>
}
