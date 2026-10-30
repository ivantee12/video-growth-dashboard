import { Pool } from 'pg'
import type { ImportRow, Video } from './types'

const globalDb = globalThis as unknown as { videoPool?: Pool }
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured. Follow the local setup in README.md.')
  return globalDb.videoPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 3000 })
}
export async function importSnapshots(rows: ImportRow[], pool = getPool(), options: {source?: string; metric?: string; preserveCategory?: boolean} = {}) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // Serialize concurrent import batches, including metadata updates.
    await client.query('SELECT pg_advisory_xact_lock(7482941)')
    for (const r of rows) {
      const result = await client.query(`INSERT INTO videos(platform,account,external_id,title,category,url,published_at,metadata_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT(platform,account,external_id) DO UPDATE SET
        title=EXCLUDED.title,category=CASE WHEN $9 THEN videos.category ELSE EXCLUDED.category END,url=EXCLUDED.url,published_at=EXCLUDED.published_at,metadata_at=EXCLUDED.metadata_at
        WHERE EXCLUDED.metadata_at >= videos.metadata_at RETURNING id`,
      [r.platform,r.account,r.video_id,r.title,r.category,r.url,r.published_at,r.captured_at,options.preserveCategory ?? false])
      const id = result.rows[0]?.id ?? (await client.query('SELECT id FROM videos WHERE platform=$1 AND account=$2 AND external_id=$3',[r.platform,r.account,r.video_id])).rows[0].id
      await client.query(`INSERT INTO snapshots(video_id,captured_at,views,source,metric) VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(video_id,captured_at) DO UPDATE SET views=EXCLUDED.views,source=EXCLUDED.source,metric=EXCLUDED.metric`,[id,r.captured_at,r.views,options.source ?? 'csv',options.metric ?? 'views'])
    }
    await client.query('COMMIT')
    return { processed: rows.length }
  } catch (e) { await client.query('ROLLBACK'); throw e }
  finally { client.release() }
}
export async function loadVideos(pool = getPool()): Promise<Video[]> {
  const result = await pool.query(`SELECT v.*,s.captured_at,s.views,s.source,s.metric FROM videos v JOIN snapshots s ON s.video_id=v.id ORDER BY s.captured_at`)
  const videos = new Map<string,Video>()
  for (const r of result.rows) {
    const id = String(r.id)
    if (!videos.has(id)) videos.set(id,{id,platform:r.platform,account:r.account,externalId:r.external_id,title:r.title,category:r.category,url:r.url,publishedAt:r.published_at.toISOString(),snapshots:[]})
    videos.get(id)!.snapshots.push({capturedAt:r.captured_at.toISOString(),views:Number(r.views),metric:r.metric,source:r.source})
  }
  return [...videos.values()]
}
