import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { Pool } from 'pg'
import { randomUUID } from 'node:crypto'
import { parseVideoCsv } from '../lib/video/csv'
import { importSnapshots, loadVideos } from '../lib/video/db'

test('PostgreSQL schema, import, idempotency, account isolation, metadata ordering and rollback',async()=>{
  // PGlite runs the PostgreSQL engine locally; advisory locking is tested only with TEST_DATABASE_URL.
  const db=process.env.TEST_DATABASE_URL ? null : new PGlite()
  const namespace=`video_growth_test_${randomUUID().replaceAll('-','')}`
  const admin=process.env.TEST_DATABASE_URL ? new Pool({connectionString:process.env.TEST_DATABASE_URL}) : null
  const native=admin ? new Pool({connectionString:process.env.TEST_DATABASE_URL,options:`-c search_path=${namespace}`}) : null
  const pool=native ?? {connect:async()=>({query:async(sql:string,args?:unknown[])=>sql.includes('pg_advisory_xact_lock')?{rows:[]}:db!.query(sql,args),release:()=>{}}),query:(sql:string,args?:unknown[])=>db!.query(sql,args)} as unknown as Pool
  try {
    if(admin) await admin.query(`CREATE SCHEMA "${namespace}"`)
    const schema=readFileSync('db/schema.sql','utf8')
    if(db) await db.exec(schema)
    else await pool.query(schema)
    const csv=parseVideoCsv(readFileSync('public/sample-videos.csv','utf8'))
    await importSnapshots(csv,pool)
    await importSnapshots(csv,pool)
    let videos=await loadVideos(pool)
    assert.equal(videos.length,4)
    assert.equal(videos.reduce((n,v)=>n+v.snapshots.length,0),12)
    await importSnapshots([{...csv[2],views:6000,category:'Updated'}],pool)
    await importSnapshots([{...csv[0],title:'Old metadata',category:'Old'}],pool)
    videos=await loadVideos(pool)
    assert.equal(videos.find(v=>v.platform==='facebook')!.category,'Updated')
    assert.equal(videos.find(v=>v.platform==='facebook')!.snapshots.at(-1)!.views,6000)
    await importSnapshots([{...csv[0],account:'other'}],pool)
    assert.equal((await loadVideos(pool)).length,5)
    await assert.rejects(importSnapshots([{...csv[0],account:'rollback'}, {...csv[1],views:-1}],pool))
    assert.equal((await loadVideos(pool)).some(v=>v.account==='rollback'),false)
    await importSnapshots([{...csv[2],views:6500,category:'Uncategorized'}],pool,{source:'api:facebook',metric:'facebook:total_video_views',preserveCategory:true})
    const synced=(await loadVideos(pool)).find(v=>v.platform==='facebook'&&v.account===csv[2].account)!
    assert.equal(synced.category,'Updated')
    assert.equal(synced.snapshots.at(-1)!.source,'api:facebook')
    assert.equal(synced.snapshots.at(-1)!.metric,'facebook:total_video_views')
    if(db) await db.exec(schema)
    else await pool.query(schema)
  } finally {
    if(db) await db.close()
    if(native) await native.end()
    if(admin) { try {await admin.query(`DROP SCHEMA IF EXISTS "${namespace}" CASCADE`)} finally {await admin.end()} }
  }
})
