import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseVideoCsv } from '../lib/video/csv'
const sample=readFileSync('public/sample-videos.csv','utf8')
test('all four platforms and timezone normalization',()=>{
  const rows=parseVideoCsv('\uFEFF'+sample)
  assert.equal(rows.length,12)
  assert.equal(rows[0].captured_at,'2026-10-22T04:00:00.000Z')
  assert.equal(rows[9].title,'活动花絮')
})
test('rejects malformed headers, counts, links, duplicates and dates',()=>{
  for (const csv of [sample.replace('platform,','bad,'),sample.replace(',1000',',-1'),sample.replace(',1000',',1.5'),sample.replace(',1000',',9007199254740992'),sample.replace('https://www.facebook.com/','javascript:alert(1)'),sample.replace('2026-10-22T12:00:00+08:00','2026-02-30T12:00:00+08:00'),sample.replace('2026-10-22T12:00:00+08:00','2026-10-22'),sample+'\n'+sample.split('\n')[1]]) assert.throws(()=>parseVideoCsv(csv))
})
test('quoted commas, multiline title, empty category, future and prepublication dates',()=>{
  const csv=sample.split('\n').slice(0,2).join('\n').replace('Community event','"Hello,\nworld"').replace(',Event,',',,')
  assert.equal(parseVideoCsv(csv)[0].title,'Hello,\nworld')
  assert.equal(parseVideoCsv(csv)[0].category,'Uncategorized')
  assert.throws(()=>parseVideoCsv(sample,new Date('2020-01-01')))
  assert.throws(()=>parseVideoCsv(sample.replace('2026-10-22T12:00:00+08:00','2026-09-01T12:00:00+08:00')))
})
