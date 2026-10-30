import { z } from 'zod'
import type { ImportRow } from '../video/types'
import type { ConnectorConfig } from './config'
import { apiJson, ConnectorError, safeLink, validated, viewCount, type Fetcher } from './client'

const MAX_PAGES=50
const MAX_VIDEOS=1000
const instant=z.string().refine(v=>Number.isFinite(Date.parse(v)))
const id=z.string().regex(/^\d+$/)
const paging=z.object({cursors:z.object({after:z.string().optional()}).optional(),next:z.string().optional()}).optional()
const metaVideo=z.object({id, title:z.string().optional(),description:z.string().optional(),caption:z.string().optional(),created_time:instant.optional(),timestamp:instant.optional(),permalink_url:safeLink.optional(),permalink:safeLink.optional(),media_type:z.string().optional()})
const metaPage=z.object({data:z.array(metaVideo),paging})
const insight=z.object({data:z.array(z.object({name:z.string(),period:z.string().optional(),values:z.array(z.object({value:viewCount})).optional(),total_value:z.object({value:viewCount}).optional()}))})
type MetaVideo=z.infer<typeof metaVideo>
export type Collection = {rows:ImportRow[];metric:string;skipped:number;warnings:string[]}

function graph(config:ConnectorConfig,path:string,query:Record<string,string>={}) {
  const url=new URL(`https://graph.facebook.com/${config.version}/${path}`)
  for(const [key,value] of Object.entries(query)) url.searchParams.set(key,value)
  return url
}
function row(config:ConnectorConfig,video:MetaVideo,views:number,now:Date): ImportRow {
  const published=video.created_time ?? video.timestamp
  if (!published || new Date(published)>now) throw new ConnectorError('A video has an invalid publication time. No snapshots were saved.')
  return {platform:config.platform,account:config.accountId,video_id:video.id,title:(video.title || video.caption || video.description || `Video ${video.id}`).slice(0,2000),category:'Uncategorized',url:video.permalink ?? video.permalink_url ?? '',published_at:new Date(published).toISOString(),captured_at:now.toISOString(),views}
}
async function graphList(config:ConnectorConfig,path:string,fields:string,fetcher:Fetcher) {
  const results:MetaVideo[]=[]
  const seen=new Set<string>()
  let after:string|undefined
  for(let page=0;page<MAX_PAGES;page++) {
    const data=validated(metaPage,await apiJson(graph(config,path,{fields,limit:'100',...(after?{after}:{})}),config.token,fetcher))
    results.push(...data.data)
    if(results.length>MAX_VIDEOS) throw new ConnectorError('This account exceeds the 1,000-item sync limit. No snapshots were saved; use CSV for older videos.')
    if(!data.paging?.next) return results
    const cursor=data.paging.cursors?.after
    if(!cursor || seen.has(cursor)) throw new ConnectorError('The platform returned invalid pagination. No snapshots were saved.')
    seen.add(cursor);after=cursor
  }
  throw new ConnectorError('Sync pagination limit reached. No snapshots were saved.')
}
export async function collectMeta(config:ConnectorConfig,fetcher:Fetcher=fetch,now=new Date()):Promise<Collection> {
  const isIg=config.platform==='instagram'
  if (!isIg) {
    const identity=validated(z.object({id}),await apiJson(graph(config,'me',{fields:'id'}),config.token,fetcher))
    if(identity.id!==config.accountId) throw new ConnectorError('The Page token does not belong to FB_PAGE_ID. No snapshots were saved.',401)
  }
  const videos=await graphList(config,`${config.accountId}/${isIg?'media':'videos'}`,isIg?'id,caption,media_type,timestamp,permalink':'id,title,description,created_time,permalink_url',fetcher)
  const metric=isIg?'views':'total_video_views'
  const rows:ImportRow[]=[]
  let skipped=0
  for(const video of videos) {
    if(isIg && video.media_type!=='VIDEO') continue
    const response=validated(insight,await apiJson(graph(config,`${video.id}/${isIg?'insights':'video_insights'}`,{metric,...(isIg?{}:{period:'lifetime'})}),config.token,fetcher))
    const item=response.data.find(v=>v.name===metric && (!v.period || v.period==='lifetime'))
    const views=item?.total_value?.value ?? item?.values?.[0]?.value
    if(views===undefined) {skipped++;continue}
    rows.push(row(config,video,views,now))
  }
  return {rows,metric:`${config.platform}:${metric}`,skipped,warnings:skipped?[`${skipped} videos had no available lifetime view count and were skipped.`]:[]}
}

const tikVideo=z.object({id,create_time:z.number().int().nonnegative(),title:z.string().optional(),video_description:z.string().optional(),share_url:safeLink.optional(),view_count:viewCount.optional()})
const tikPage=z.object({data:z.object({videos:z.array(tikVideo),has_more:z.boolean(),cursor:z.number().int().optional()})})
export async function collectTikTok(config:ConnectorConfig,fetcher:Fetcher=fetch,now=new Date()):Promise<Collection> {
  const identity=validated(z.object({data:z.object({user:z.object({open_id:z.string()})})}),await apiJson(new URL('https://open.tiktokapis.com/v2/user/info/?fields=open_id'),config.token,fetcher))
  if(identity.data.user.open_id!==config.accountId) throw new ConnectorError('The TikTok token does not belong to TIKTOK_OPEN_ID. No snapshots were saved.',401)
  const rows:ImportRow[]=[]
  const cursors=new Set<number>()
  let cursor:number|undefined
  let seen=0,skipped=0
  for(let page=0;page<MAX_PAGES;page++) {
    const url=new URL('https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,create_time,share_url,view_count')
    const result=validated(tikPage,await apiJson(url,config.token,fetcher,{max_count:20,...(cursor===undefined?{}:{cursor})}))
    seen+=result.data.videos.length
    if(seen>MAX_VIDEOS) throw new ConnectorError('This account exceeds the 1,000-video sync limit. No snapshots were saved.')
    for(const video of result.data.videos) {
      if(video.view_count===undefined) {skipped++;continue}
      const published=new Date(video.create_time*1000)
      if(!Number.isFinite(published.getTime())) throw new ConnectorError('Invalid TikTok publication time. No snapshots were saved.')
      rows.push(row(config,{id:video.id,title:video.title,description:video.video_description,created_time:published.toISOString(),permalink:video.share_url},video.view_count,now))
    }
    if(!result.data.has_more) return {rows,metric:'tiktok:view_count',skipped,warnings:skipped?[`${skipped} videos had no view count and were skipped.`]:[]}
    const next=result.data.cursor
    if(next===undefined || cursors.has(next)) throw new ConnectorError('TikTok returned invalid pagination. No snapshots were saved.')
    cursors.add(next);cursor=next
  }
  throw new ConnectorError('Sync pagination limit reached. No snapshots were saved.')
}
