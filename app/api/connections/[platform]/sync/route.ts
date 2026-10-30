import { NextRequest, NextResponse } from 'next/server'
import { apiPlatforms, getConnectorConfig, type ApiPlatform } from '@/lib/connectors/config'
import { collectMeta, collectTikTok } from '@/lib/connectors/collect'
import { ConnectorError } from '@/lib/connectors/client'
import { getPool, importSnapshots } from '@/lib/video/db'
import { isLocalWrite } from '@/lib/video/local-request'
export const runtime='nodejs'
const running=new Set<string>()
const lastStarted=new Map<string,number>()
export async function POST(request:NextRequest,{params}:{params:Promise<{platform:string}>}) {
  if(!isLocalWrite(request)) return NextResponse.json({error:'Same-origin requests only.'},{status:403})
  const {platform}=await params
  if(!apiPlatforms.includes(platform as ApiPlatform)) return NextResponse.json({error:'API sync is not available for this platform.'},{status:400})
  if(running.has(platform)) return NextResponse.json({error:'A sync is already running for this platform.'},{status:409})
  let config
  try { config=getConnectorConfig(platform as ApiPlatform) }
  catch(e) { return NextResponse.json({error:e instanceof Error?e.message:'Configure this platform first.'},{status:400}) }
  if(Date.now()-(lastStarted.get(platform)??0)<60000) return NextResponse.json({error:'Wait one minute between sync attempts.'},{status:429})
  running.add(platform)
  try {
    try { await getPool().query('SELECT metric FROM snapshots LIMIT 0') }
    catch { return NextResponse.json({error:'Local database is not ready. Run npm.cmd run db:migrate before syncing.'},{status:503}) }
    lastStarted.set(platform,Date.now())
    const deadline=AbortSignal.timeout(120000)
    const fetcher:typeof fetch=(input,init)=>fetch(input,{...init,signal:AbortSignal.any([deadline,...(init?.signal?[init.signal]:[])])})
    const result=await (platform==='tiktok'?collectTikTok(config,fetcher):collectMeta(config,fetcher))
    if(result.rows.length) await importSnapshots(result.rows,getPool(),{source:`api:${platform}`,metric:result.metric,preserveCategory:true})
    return NextResponse.json({saved:result.rows.length,skipped:result.skipped,warnings:result.warnings,metric:result.metric,syncedAt:new Date().toISOString()})
  } catch(e) {
    if(e instanceof ConnectorError) return NextResponse.json({error:e.message},{status:e.status})
    return NextResponse.json({error:'Sync could not be saved to the local database. Check PostgreSQL and try again.'},{status:503})
  } finally { running.delete(platform) }
}
