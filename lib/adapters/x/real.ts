import type { PlatformAdapter } from '../types'
import { PLATFORM_META } from '../types'

/**
 * X (Twitter) v2 API adapter — STUB.
 *
 * Required env: X_BEARER_TOKEN (and X_USER_ID for self lookups).
 * Docs: https://developer.x.com/en/docs/x-api
 *
 * Implementation hints:
 *  - Use GET /2/users/:id/tweets with tweet.fields=public_metrics,created_at
 *    to populate top content + per-tweet impressions/engagements.
 *  - Use GET /2/users/:id?user.fields=public_metrics for follower count.
 *  - The free tier rate-limits aggressively; cache responses per day.
 */
export function makeXAdapter(): PlatformAdapter {
  const token = process.env.X_BEARER_TOKEN
  if (!token) throw new Error('X_BEARER_TOKEN is not set')

  return {
    meta: PLATFORM_META.x,
    source: 'live',
    async getOverview() {
      throw new Error('X live adapter not yet implemented — set DEMO_MODE=true or implement this stub.')
    },
    async getTimeSeries() {
      throw new Error('X live adapter not yet implemented.')
    },
    async getTopContent() {
      throw new Error('X live adapter not yet implemented.')
    },
  }
}
