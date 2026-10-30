import { test } from 'node:test'
import assert from 'node:assert/strict'
import { growth, summarize } from '../lib/video/analytics'
import type { Video } from '../lib/video/types'
const asOf = new Date('2026-10-29T12:00:00Z')
const video: Video = {id:'1',platform:'facebook',account:'mine',externalId:'v',title:'Video',category:'Event',url:'',publishedAt:'2026-10-01T00:00:00Z',snapshots:[
  {capturedAt:'2026-10-22T12:00:00Z',views:100},{capturedAt:'2026-10-28T12:00:00Z',views:500},{capturedAt:'2026-10-29T12:00:00Z',views:800}
]}
test('24h and 7d use cumulative count differences',()=>{
  assert.equal(growth(video,1,asOf)?.delta,300)
  assert.equal(growth(video,1,asOf)?.percent,60)
  assert.equal(growth(video,7,asOf)?.delta,700)
})
test('missing baseline and stale endpoints stay unknown',()=>{
  assert.equal(growth({...video,snapshots:video.snapshots.slice(-1)},1,asOf),null)
  assert.equal(growth(video,1,new Date('2026-10-30T12:00:00Z')),null)
  assert.equal(growth({...video,snapshots:[video.snapshots[0],video.snapshots[2]]},1,asOf),null)
})
test('zero baseline has no percent; downward corrections are retained',()=>{
  assert.equal(growth({...video,snapshots:[{...video.snapshots[1],views:0},video.snapshots[2]]},1,asOf)?.percent,null)
  assert.equal(growth({...video,snapshots:[video.snapshots[1],{...video.snapshots[2],views:400}]},1,asOf)?.delta,-100)
})
test('category averages exclude unknown growth and show coverage',()=>{
  const result=summarize([video,{...video,id:'2',snapshots:video.snapshots.slice(-1)}],1,asOf)
  assert.deepEqual(result.categories[0],{category:'Event',count:2,measured:1,total:300,average:300})
})
test('six hour baseline tolerance, future exclusion and shuffled input',()=>{
  const v={...video,snapshots:[video.snapshots[2],{...video.snapshots[1],capturedAt:'2026-10-28T06:00:00Z'},{capturedAt:'2026-10-30T00:00:00Z',views:99999}]}
  assert.equal(growth(v,1,asOf)?.delta,300)
  v.snapshots[1].capturedAt='2026-10-28T05:59:59Z'
  assert.equal(growth(v,1,asOf),null)
})
test('growth does not compare different metric definitions',()=>{
  const mixed={...video,snapshots:[{...video.snapshots[1],metric:'views'},{...video.snapshots[2],metric:'facebook:total_video_views'}]}
  assert.equal(growth(mixed,1,asOf),null)
  mixed.snapshots[0].metric='facebook:total_video_views'
  assert.equal(growth(mixed,1,asOf)?.delta,300)
})
