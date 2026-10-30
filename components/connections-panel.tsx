'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PlatformLogo } from './platform-logo'
import type { connectorStatus } from '@/lib/connectors/config'

type Status=ReturnType<typeof connectorStatus>
export function ConnectionsPanel({statuses}:{statuses:Status}) {
  const [busy,setBusy]=useState<string|null>(null)
  const [messages,setMessages]=useState<Record<string,string>>({})
  async function sync(platform:string) {
    setBusy(platform)
    setMessages(m=>({...m,[platform]:'Collecting video views… Keep this page open.'}))
    try {
      const response=await fetch(`/api/connections/${platform}/sync`,{method:'POST'})
      const result=await response.json()
      setMessages(m=>({...m,[platform]:response.ok?`${result.saved} snapshots saved; ${result.skipped} skipped. ${result.warnings.join(' ')} ${result.saved?'Open the dashboard to see your latest data.':'The API returned no usable video views; no data was invented.'}`:result.error}))
    } catch {setMessages(m=>({...m,[platform]:'Could not complete sync. Check the local server and try again.'}))}
    finally {setBusy(null)}
  }
  return <div className="space-y-6"><header><p className="mb-2 text-sm text-emerald-300">LOCAL WORKSPACE</p><h1 className="text-3xl font-semibold">Data connections</h1><p className="mt-2 text-brand-muted">Connect your own accounts with approved access tokens, then collect a snapshot of current video views.</p></header>
    <section className="grid gap-4 md:grid-cols-2">{statuses.map(s=><article className="card space-y-4" key={s.platform}>
      <div className="flex items-center gap-3"><PlatformLogo platform={s.platform} size={40}/><h2 className="text-xl capitalize">{s.platform}</h2></div>
      <p className={s.configured?'text-emerald-300':'text-amber-200'}>{s.configured?'Configured · ready to verify with a sync':'Setup required'}</p>
      {s.accountId&&<p className="break-all text-sm text-brand-muted">Account ID: {s.accountId}</p>}
      <p className="text-sm text-brand-muted">{s.platform==='facebook'?'Facebook Pages · videos returned by the Page videos API · total_video_views':s.platform==='instagram'?'Professional Instagram account through Facebook Login · video media only · views':'Authorized TikTok account · public videos · view_count'}</p>
      {!s.configured&&<p className="text-sm [overflow-wrap:anywhere]">Add to .env.local: {s.missing.join(', ')}. Restart the app after saving.</p>}
      <button className="rounded-lg bg-emerald-400 px-4 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-40" disabled={!s.configured||busy!==null} onClick={()=>void sync(s.platform)}>{busy===s.platform?'Syncing…':`Sync ${s.platform} now`}</button>
      <p role="status" className="text-sm [overflow-wrap:anywhere]">{messages[s.platform]}</p>
    </article>)}
    <article className="card space-y-4"><div className="flex items-center gap-3"><PlatformLogo platform="xiaohongshu" size={40}/><h2 className="text-xl">Xiaohongshu · 小红书</h2></div><p className="text-amber-200">CSV import available · API unavailable</p><p className="text-sm text-brand-muted">The documented public scopes do not currently provide creator video-view analytics. Import your creator exports or manually recorded counts.</p><Link className="inline-block text-emerald-300" href="/">Import CSV on dashboard →</Link></article></section>
    <section className="card space-y-3"><h2 className="text-xl">Before you sync</h2><p>The connector code is implemented; a successful sync verifies your token and account access. Tokens are read only by the local server and are never sent to this page. Follow API_SETUP.md in the project folder for setup.</p><p className="text-brand-muted">Run npm.cmd run db:migrate once to upgrade the database, then restart the app. The first sync starts your history. Sync again about 24 hours later for daily growth and after seven days for weekly growth. OAuth sign-in, automatic token renewal and scheduled syncs are not implemented.</p><p className="text-brand-muted">Syncs preserve category labels. API counts and CSV counts use separate metric labels; growth is shown only when both snapshots use the same metric. One account per platform is supported in this version.</p><Link href="/" className="inline-block text-emerald-300">Open dashboard →</Link></section>
  </div>
}
