import { test } from 'node:test'
import assert from 'node:assert/strict'
import { collectMeta, collectTikTok } from '../lib/connectors/collect'
import { apiJson, ConnectorError, type Fetcher } from '../lib/connectors/client'
import { connectorStatus, getConnectorConfig, type ConnectorConfig } from '../lib/connectors/config'
const now=new Date('2026-10-30T12:00:00Z')
const fb:ConnectorConfig={platform:'facebook',accountId:'123',token:'PRIVATE_TOKEN',version:'v26.0'}
const ig:ConnectorConfig={...fb,platform:'instagram'}
const tt:ConnectorConfig={...fb,platform:'tiktok',accountId:'own-open-id'}
function fixture(responses:unknown[],calls:{url:URL;init?:RequestInit}[]=[]) {
  const mock:Fetcher=async(input,init)=>{
    calls.push({url:new URL(String(input)),init})
    assert.ok(responses.length,'Unexpected API request')
    return Response.json(responses.shift())
  }
  return mock
}
const video={id:'100',title:'Example video',created_time:'2026-10-01T12:00:00+0000',permalink_url:'https://www.facebook.com/watch/?v=100'}
const views=(name:string,value:number)=>({data:[{name,period:'lifetime',values:[{value}]}]})
test('Facebook verifies Page identity, paginates on a fixed host and reads lifetime views',async()=>{
  const calls:{url:URL;init?:RequestInit}[]=[]
  const result=await collectMeta(fb,fixture([
    {id:'123'},
    {data:[video],paging:{next:'https://evil.example/leak?access_token=PRIVATE_TOKEN',cursors:{after:'CURSOR'}}},
    {data:[{...video,id:'101'}]},views('total_video_views',100),views('total_video_views',0),
  ],calls),now)
  assert.equal(result.rows.length,2)
  assert.equal(result.rows[1].views,0)
  assert.equal(result.metric,'facebook:total_video_views')
  assert.equal(result.rows[0].account,'123')
  assert.equal(result.rows[0].captured_at,now.toISOString())
  assert.equal(calls[2].url.searchParams.get('after'),'CURSOR')
  for(const call of calls) {
    assert.equal(call.url.hostname,'graph.facebook.com')
    assert.equal(call.url.href.includes('PRIVATE_TOKEN'),false)
    assert.equal((call.init?.headers as Record<string,string>).Authorization,'Bearer PRIVATE_TOKEN')
  }
})
test('Facebook refuses mismatched Page token before reading videos',async()=>{
  await assert.rejects(collectMeta(fb,fixture([{id:'456'}]),now),/does not belong/)
})
test('Instagram imports only video media and skips missing counts without inventing zero',async()=>{
  const result=await collectMeta(ig,fixture([
    {data:[{id:'1',media_type:'IMAGE'},{id:'2',media_type:'VIDEO',timestamp:'2026-10-01T12:00:00Z',caption:'Reel',permalink:'https://instagram.com/reel/2'},{id:'3',media_type:'VIDEO',timestamp:'2026-10-01T12:00:00Z'}]},
    {data:[{name:'views',total_value:{value:650}}]}, {data:[]},
  ]),now)
  assert.equal(result.rows.length,1)
  assert.equal(result.rows[0].views,650)
  assert.equal(result.skipped,1)
  assert.equal(result.metric,'instagram:views')
})
test('TikTok verifies identity and follows pagination with approved view_count field',async()=>{
  const calls:{url:URL;init?:RequestInit}[]=[]
  const result=await collectTikTok(tt,fixture([
    {data:{user:{open_id:'own-open-id'}},error:{code:'ok'}},
    {data:{videos:[{id:'11',create_time:1790841600,title:'TikTok',view_count:42}],has_more:true,cursor:1234},error:{code:'ok'}},
    {data:{videos:[{id:'12',create_time:1790841600}],has_more:false},error:{code:'ok'}},
  ],calls),now)
  assert.equal(result.rows.length,1)
  assert.equal(result.rows[0].views,42)
  assert.equal(result.skipped,1)
  assert.equal(JSON.parse(calls[2].init!.body as string).cursor,1234)
  assert.ok(calls[1].url.searchParams.get('fields')!.includes('view_count'))
})
test('TikTok refuses a token for another account',async()=>{
  await assert.rejects(collectTikTok(tt,fixture([{data:{user:{open_id:'someone-else'}}}]),now),/does not belong/)
})
test('rejects malformed counts and repeated/missing pagination cursors',async()=>{
  await assert.rejects(collectMeta(fb,fixture([{id:'123'},{data:[video]},views('total_video_views',-1)]),now),/incomplete or changed/)
  await assert.rejects(collectMeta(ig,fixture([{data:[],paging:{next:'https://graph.facebook.com/next'}}]),now),/invalid pagination/)
  await assert.rejects(collectTikTok(tt,fixture([{data:{user:{open_id:'own-open-id'}}},{data:{videos:[],has_more:true,cursor:1}},{data:{videos:[],has_more:true,cursor:1}}]),now),/invalid pagination/)
})
test('API failures redact raw platform messages, reject untrusted hosts and retain useful status',async()=>{
  const url=new URL('https://graph.facebook.com/v26.0/me')
  for(const [response,status] of [[Response.json({error:{code:190,message:'PRIVATE_TOKEN'}}, {status:400}),401],[Response.json({error:{code:4,message:'PRIVATE_TOKEN'}}),429]] as const) {
    try { await apiJson(url,'PRIVATE_TOKEN',async()=>response);assert.fail('Expected failure') }
    catch(e) {assert.ok(e instanceof ConnectorError);assert.equal(e.status,status);assert.equal(e.message.includes('PRIVATE_TOKEN'),false)}
  }
  await assert.rejects(apiJson(new URL('https://evil.example/'),'PRIVATE_TOKEN',fixture([])),/Unsupported API host/)
  await assert.rejects(apiJson(url,'PRIVATE_TOKEN',async()=>{throw new Error('PRIVATE_TOKEN')}),/could not be reached/)
})
test('configuration exposes status and variable names, never tokens',()=>{
  const env={FB_PAGE_ID:'123',FB_PAGE_ACCESS_TOKEN:'PRIVATE_TOKEN',META_GRAPH_VERSION:'v26.0'}
  const status=connectorStatus(env)
  assert.equal(status[0].configured,true)
  assert.equal(status[1].configured,false)
  assert.equal(JSON.stringify(status).includes('PRIVATE_TOKEN'),false)
  assert.equal(getConnectorConfig('facebook',env).token,'PRIVATE_TOKEN')
  assert.throws(()=>getConnectorConfig('tiktok',env),/TIKTOK_OPEN_ID/)
  assert.equal(connectorStatus({...env,FB_PAGE_ID:'../me'})[0].configured,false)
})
test('a later API error fails the entire collection rather than returning partial rows',async()=>{
  await assert.rejects(collectMeta(ig,fixture([
    {data:[{id:'1',media_type:'VIDEO',timestamp:'2026-10-01T00:00:00Z'},{id:'2',media_type:'VIDEO',timestamp:'2026-10-01T00:00:00Z'}]},
    views('views',25),{error:{code:190,message:'secret'}},
  ]),now),/token is invalid or expired/)
})
