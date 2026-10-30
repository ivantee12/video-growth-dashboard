import type { PlatformAdapter } from '../types'
import { PLATFORM_META } from '../types'

/**
 * YouTube Data API v3 adapter — STUB.
 *
 * Required env: YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID.
 * Docs: https://developers.google.com/youtube/v3/docs
 *
 * Implementation hints:
 *  - channels.list?part=statistics → subscriber/view counts.
 *  - search.list?channelId=...&order=date → recent video IDs.
 *  - videos.list?part=statistics,snippet&id=... → per-video metrics.
 *  - For watch-time data, switch to YouTube Analytics API (OAuth required).
 */
export function makeYouTubeAdapter(): PlatformAdapter {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) throw new Error('YOUTUBE_API_KEY is not set')

  return {
    meta: PLATFORM_META.youtube,
    source: 'live',
    async getOverview() {
      throw new Error('YouTube live adapter not yet implemented — set DEMO_MODE=true or implement this stub.')
    },
    async getTimeSeries() {
      throw new Error('YouTube live adapter not yet implemented.')
    },
    async getTopContent() {
      throw new Error('YouTube live adapter not yet implemented.')
    },
  }
}
