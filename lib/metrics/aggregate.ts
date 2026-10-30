import type { OverviewMetrics, TimeSeriesPoint } from '@/lib/adapters/types'

export interface AggregateOverview {
  followers: number
  followersDelta: number
  impressions: number
  engagement: number
  posts: number
  engagementRate: number
}

export function aggregateOverview(items: OverviewMetrics[]): AggregateOverview {
  const followers = items.reduce((s, x) => s + x.followers, 0)
  const followersDelta = items.reduce((s, x) => s + x.followersDelta, 0)
  const impressions = items.reduce((s, x) => s + x.impressions, 0)
  const engagement = items.reduce((s, x) => s + x.engagement, 0)
  const posts = items.reduce((s, x) => s + x.posts, 0)
  const engagementRate = impressions === 0 ? 0 : (engagement / impressions) * 100
  return { followers, followersDelta, impressions, engagement, posts, engagementRate }
}

export function sumTimeSeries(seriesList: TimeSeriesPoint[][]): TimeSeriesPoint[] {
  if (seriesList.length === 0) return []
  const byDate = new Map<string, TimeSeriesPoint>()
  for (const series of seriesList) {
    for (const point of series) {
      const existing = byDate.get(point.date)
      if (existing) {
        existing.followers += point.followers
        existing.impressions += point.impressions
        existing.engagement += point.engagement
      } else {
        byDate.set(point.date, { ...point })
      }
    }
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}
