import { parse } from 'csv-parse/sync'
import { platforms, type ImportRow } from './types'

export class ImportError extends Error {}
const required = ['platform','account','video_id','title','category','url','published_at','captured_at','views']
const iso = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/
function timestamp(value: string, field: string, row: number) {
  const date = new Date(value)
  const day = value.slice(0, 10)
  const calendarDay = new Date(day + 'T00:00:00Z')
  if (!iso.test(value) || !Number.isFinite(date.getTime()) || !Number.isFinite(calendarDay.getTime()) || calendarDay.toISOString().slice(0,10) !== day) {
    throw new ImportError(`Row ${row}: ${field} must be a valid ISO timestamp with timezone.`)
  }
  return date.toISOString()
}
export function parseVideoCsv(csv: string, now = new Date()): ImportRow[] {
  let records: Record<string, string>[]
  try {
    records = parse(csv, { bom: true, skip_empty_lines: true, trim: true, columns(headers: string[]) {
      if (headers.length !== required.length || new Set(headers).size !== headers.length || required.some(h => !headers.includes(h))) {
        throw new ImportError(`CSV headers must be: ${required.join(',')}`)
      }
      return headers
    } })
  } catch (e) { throw new ImportError(e instanceof ImportError ? e.message : 'Invalid CSV. Check quoting and column counts.') }
  if (!records.length || records.length > 10000) throw new ImportError('Import between 1 and 10,000 snapshot rows per file.')
  const seen = new Set<string>()
  return records.map((r, i) => {
    const n = i + 2
    for (const key of ['platform','account','video_id','title','published_at','captured_at','views']) {
      if (!r[key]) throw new ImportError(`Row ${n}: ${key} is required.`)
    }
    if (Object.values(r).some(v => v.length > 2000)) throw new ImportError(`Row ${n}: field exceeds 2,000 characters.`)
    if (!platforms.includes(r.platform as ImportRow['platform'])) throw new ImportError(`Row ${n}: unsupported platform.`)
    if (!/^\d+$/.test(r.views) || !Number.isSafeInteger(Number(r.views))) throw new ImportError(`Row ${n}: views must be a non-negative safe integer.`)
    if (r.url) {
      try { if (!['https:','http:'].includes(new URL(r.url).protocol)) throw new Error() }
      catch { throw new ImportError(`Row ${n}: url must use http or https.`) }
    }
    const published_at = timestamp(r.published_at, 'published_at', n)
    const captured_at = timestamp(r.captured_at, 'captured_at', n)
    if (published_at > captured_at) throw new ImportError(`Row ${n}: snapshot cannot precede publication.`)
    if (new Date(captured_at).getTime() > now.getTime() + 300000) throw new ImportError(`Row ${n}: snapshot is in the future.`)
    const key = JSON.stringify([r.platform,r.account,r.video_id,captured_at])
    if (seen.has(key)) throw new ImportError(`Row ${n}: duplicate video snapshot in this file.`)
    seen.add(key)
    return { ...r, platform: r.platform as ImportRow['platform'], category: r.category || 'Uncategorized', published_at, captured_at, views: Number(r.views) } as ImportRow
  })
}
