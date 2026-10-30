'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PlatformLogo } from './platform-logo'
import { summarize } from '@/lib/video/analytics'
import { platforms, type Video } from '@/lib/video/types'

const fmt = (n: number | null | undefined) => n == null ? '—' : n.toLocaleString(undefined, {maximumFractionDigits:1})
const label = (s: string) => s === 'xiaohongshu' ? 'Xiaohongshu · 小红书' : s.charAt(0).toUpperCase()+s.slice(1)
export function VideoDashboard({videos,databaseError}:{videos:Video[];databaseError?:string}) {
  const router = useRouter()
  const [platform,setPlatform] = useState('all')
  const [account,setAccount] = useState('all')
  const [category,setCategory] = useState('all')
  const [days,setDays] = useState(1)
  const [sort,setSort] = useState('growth')
  const [selected,setSelected] = useState('')
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)
  const filtered = videos.filter(v=>(platform==='all'||v.platform===platform)&&(account==='all'||v.account===account)&&(category==='all'||v.category===category))
  const asOf = new Date(filtered.reduce((latest,v)=>v.snapshots.reduce((n,s)=>Math.max(n,new Date(s.capturedAt).getTime()),latest),0))
  const {rows,categories} = summarize(filtered,days,asOf)
  const ranked = [...rows].sort((a,b)=>sort==='views' ? (b.latest?.views ?? -1)-(a.latest?.views ?? -1) : (b.growth?.delta ?? -Infinity)-(a.growth?.delta ?? -Infinity))
  const measured = rows.filter(v=>v.growth)
  const totalGrowth = measured.length ? measured.reduce((n,v)=>n+v.growth!.delta,0) : null
  const detail = rows.find(v=>v.id===selected)
  async function upload(file?:File) {
    if (!file) return
    if (file.size>2*1024*1024) {setMessage('Maximum file size is 2 MB.');return}
    setBusy(true);setMessage('Importing snapshots…')
    try {
      const response = await fetch('/api/videos/import',{method:'POST',headers:{'Content-Type':'text/csv'},body:await file.text()})
      const data = await response.json()
      setMessage(response.ok ? `${data.processed} snapshot rows saved. Re-importing the same timestamps updates existing records.` : data.error)
      if (response.ok) router.refresh()
    } catch {setMessage('Import failed. Check that the local app is running.')}
    finally {setBusy(false)}
  }
  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-sm text-emerald-300">YOUR ACCOUNTS · VIDEO SNAPSHOTS</p><h1 className="text-3xl font-semibold tracking-tight">Which videos are gaining momentum?</h1><p className="mt-2 text-brand-muted">Compare video views and discover your fastest-growing content categories.</p></div><a href="/sample-videos.csv" download className="rounded-lg border border-brand-border px-4 py-2 text-sm">Download example CSV</a></header>
    {databaseError && <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">{databaseError}</p>}
    <section className="card flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold">Import your video snapshots</h2><p className="mt-1 text-sm text-brand-muted">UTF-8 CSV · max 2 MB / 10,000 rows · all rows validated before saving</p></div><label className={`rounded-lg bg-emerald-400 px-4 py-2 font-medium text-slate-950 ${busy?'opacity-50':'cursor-pointer'}`}>{busy?'Importing…':'Choose CSV'}<input aria-label="Import CSV" className="sr-only" type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>{void upload(e.target.files?.[0]);e.target.value=''}} /></label><p role="status" className="w-full min-w-0 text-sm [overflow-wrap:anywhere]">{message}</p></section>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Platform shortcuts">{platforms.map(p=><button key={p} onClick={()=>setPlatform(platform===p?'all':p)} aria-pressed={platform===p} className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm ${platform===p?'border-emerald-400 bg-emerald-400/10':'border-brand-border bg-brand-surface'}`}><PlatformLogo platform={p}/><span>{label(p)}</span></button>)}</section>
    <section className="flex flex-wrap gap-3" aria-label="Filters">
      <Filter title="Platform" value={platform} onChange={setPlatform} options={platforms.map(p=>[p,label(p)])}/>
      <Filter title="Account" value={account} onChange={setAccount} options={[...new Set(videos.map(v=>v.account))].map(v=>[v,v])}/>
      <Filter title="Category" value={category} onChange={setCategory} options={[...new Set(videos.map(v=>v.category))].map(v=>[v,v])}/>
      <label className="text-xs text-brand-muted">Growth window<select className="mt-1 block rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-fg" value={days} onChange={e=>setDays(Number(e.target.value))}><option value={1}>24 hours</option><option value={7}>7 days</option></select></label>
    </section>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
      ['Tracked videos',rows.length],['Latest recorded views',rows.length?rows.reduce((n,v)=>n+(v.latest?.views??0),0):null],
      [`Observed ${days===1?'24h':'7d'} change`,totalGrowth],['Videos with valid history',`${measured.length} / ${rows.length}`]
    ].map(([title,value])=><article key={title} className="card"><p className="text-sm text-brand-muted">{title}</p><p className="mt-3 text-3xl font-semibold">{typeof value==='string'?value:fmt(value as number|null)}</p></article>)}</div>
    <p className="text-xs leading-relaxed text-brand-muted">{rows.length ? `Comparison time: ${asOf.toISOString()}. ` : ''}Growth uses observed snapshots: latest within 6 hours of comparison time, baseline at or before the window start within 6 hours. Missing history is —. Totals include only videos with valid history; negative changes are retained. Latest views may include older snapshots.</p>
    <section className="card"><h2 className="text-xl font-semibold">Fastest-growing categories</h2><p className="mt-1 text-sm text-brand-muted">Ranked by average view change per video with valid history. Coverage is shown to help compare sample sizes.</p><div className="mt-5 space-y-4">{categories.map(c=><div key={c.category}><div className="mb-2 flex flex-wrap justify-between gap-2 text-sm"><span>{c.category} <span className="text-brand-muted">· {c.measured}/{c.count} measured</span></span><span>{fmt(c.average)} avg · {fmt(c.total)} total</span></div><div className="h-2 rounded bg-brand-border"><div className="h-2 rounded bg-emerald-400" style={{width:`${c.average==null?0:Math.max(0,c.average)/Math.max(1,...categories.map(x=>x.average??0))*100}%`}}/></div></div>)}{!categories.length&&<p className="text-brand-muted">Import snapshots to compare content categories.</p>}</div></section>
    <section className="card"><div className="mb-5 flex flex-wrap justify-between gap-3"><h2 className="text-xl font-semibold">Video performance</h2><label className="text-sm">Sort by <select aria-label="Sort videos" className="rounded border border-brand-border bg-brand-surface p-1" value={sort} onChange={e=>setSort(e.target.value)}><option value="growth">View growth</option><option value="views">Latest views</option></select></label></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-brand-muted"><tr>{['Video / account','Category','Latest views','Change','Growth %','Snapshot (UTC)'].map(h=><th className="pb-4 pr-5" key={h}>{h}</th>)}</tr></thead><tbody>{ranked.map(v=><tr key={v.id} className="border-t border-brand-border"><td className="py-4 pr-5"><button onClick={()=>setSelected(v.id)} className="text-left font-medium hover:text-emerald-300">{v.title}</button><p className="mt-1 text-xs text-brand-muted"><span className="inline-flex items-center gap-2"><PlatformLogo platform={v.platform} size={18}/>{label(v.platform)} · {v.account}</span></p>{v.url&&<a className="text-xs text-emerald-300" href={v.url} target="_blank" rel="noreferrer">Open video ↗</a>}</td><td className="pr-5">{v.category}</td><td className="pr-5">{fmt(v.latest?.views)}</td><td className="pr-5" title={v.growth?`${v.growth.from} → ${v.growth.to} (${fmt(v.growth.hours)} hours)`:'Insufficient or stale history'}>{fmt(v.growth?.delta)}</td><td className="pr-5">{v.growth?.percent==null?'—':`${fmt(v.growth.percent)}%`}</td><td className="whitespace-nowrap text-xs text-brand-muted">{v.latest?.capturedAt.replace('T',' ').slice(0,16)}</td></tr>)}</tbody></table>{!rows.length&&<p className="py-10 text-center text-brand-muted">No videos yet for these filters. Import a CSV to begin.</p>}</div></section>
    {detail&&<section className="card"><div className="flex justify-between"><h2 className="text-xl">Snapshot history · {detail.title}</h2><button aria-label="Close history" onClick={()=>setSelected('')}>Close</button></div><p className="my-3 text-sm text-brand-muted">Published {detail.publishedAt}. Snapshot times are UTC. Values are cumulative views.</p><div className="max-h-72 overflow-auto">{detail.snapshots.map(s=><div key={s.capturedAt} className="flex justify-between border-t border-brand-border py-3 text-sm"><time>{s.capturedAt}</time><span>{fmt(s.views)} views · {s.metric ?? 'views'} · {s.source ?? 'csv'}</span></div>)}</div></section>}
    <footer className="text-xs text-brand-muted">CSV + authorized API snapshots · <Link href="/settings" className="text-emerald-300">Manage connections</Link> · Category labels can be changed by re-importing the latest snapshot.</footer>
  </div>
}
function Filter({title,value,onChange,options}:{title:string;value:string;onChange:(v:string)=>void;options:string[][]}) {
  return <label className="text-xs text-brand-muted">{title}<select className="mt-1 block max-w-64 rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-fg" value={value} onChange={e=>onChange(e.target.value)}><option value="all">All {title === 'Category' ? 'categories' : `${title.toLowerCase()}s`}</option>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
}


