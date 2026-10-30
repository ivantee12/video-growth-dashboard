import type { Video } from './types'

// Observed change only: do not interpolate sparse snapshots or assume zero at publication.
export function growth(video: Video, days: number, asOf: Date) {
  const points = video.snapshots.filter(s => new Date(s.capturedAt) <= asOf).sort((a,b) => a.capturedAt.localeCompare(b.capturedAt))
  const latest = points.at(-1)
  if (!latest) return null
  const target = asOf.getTime() - days * 86400000
  // Require a recent endpoint and a baseline at/before the target within six hours.
  if (asOf.getTime() - new Date(latest.capturedAt).getTime() > 6 * 3600000) return null
  const baseline = points.filter(s => new Date(s.capturedAt).getTime() <= target).at(-1)
  if (!baseline || target - new Date(baseline.capturedAt).getTime() > 6 * 3600000 || baseline === latest) return null
  // Different API metrics and manual CSV counts may use different definitions.
  if ((baseline.metric ?? 'views') !== (latest.metric ?? 'views')) return null
  const delta = latest.views - baseline.views
  return { delta, percent: baseline.views === 0 ? null : delta / baseline.views * 100,
    from: baseline.capturedAt, to: latest.capturedAt, hours: (new Date(latest.capturedAt).getTime() - new Date(baseline.capturedAt).getTime()) / 3600000 }
}
export function summarize(videos: Video[], days: number, asOf: Date) {
  const rows = videos.map(video => ({ ...video, latest: video.snapshots.filter(s => new Date(s.capturedAt) <= asOf).sort((a,b)=>a.capturedAt.localeCompare(b.capturedAt)).at(-1), growth: growth(video, days, asOf) }))
  const categories = [...new Set(rows.map(v => v.category))].map(category => {
    const group = rows.filter(v=>v.category===category)
    const measured = group.filter(v=>v.growth !== null)
    const total = measured.reduce((n,v)=>n+v.growth!.delta,0)
    return { category, count: group.length, measured: measured.length, total: measured.length ? total : null, average: measured.length ? total / measured.length : null }
  }).sort((a,b)=>(b.average ?? -Infinity)-(a.average ?? -Infinity))
  return { rows, categories }
}
