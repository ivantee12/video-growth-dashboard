import { NextRequest, NextResponse } from 'next/server'
import { ImportError, parseVideoCsv } from '@/lib/video/csv'
import { importSnapshots } from '@/lib/video/db'
import { isLocalWrite } from '@/lib/video/local-request'
export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  // Browser writes must originate from this local app. No credential/cookie authentication is implied.
  if (!isLocalWrite(request)) return NextResponse.json({error:'Same-origin requests only.'},{status:403})
  if (!request.headers.get('content-type')?.startsWith('text/csv')) return NextResponse.json({error:'Send text/csv.'},{status:415})
  try {
    const chunks: Uint8Array[] = []
    let bytes = 0
    const reader = request.body?.getReader()
    if (!reader) throw new ImportError('CSV body is required.')
    while (true) {
      const {value,done} = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > 2 * 1024 * 1024) { await reader.cancel(); return NextResponse.json({error:'Maximum file size is 2 MB.'},{status:413}) }
      chunks.push(value)
    }
    const rows = parseVideoCsv(Buffer.concat(chunks).toString('utf8'))
    return NextResponse.json(await importSnapshots(rows))
  } catch(e) {
    if (e instanceof ImportError) return NextResponse.json({error:e.message},{status:400})
    console.error('Snapshot import failed:', e instanceof Error ? e.name : 'Database error')
    return NextResponse.json({error:'Database unavailable or not initialized. Follow the local database setup in README.md.'},{status:503})
  }
}
