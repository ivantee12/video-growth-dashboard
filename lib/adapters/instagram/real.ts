import type { PlatformAdapter } from '../types'
import { PLATFORM_META } from '../types'

/**
 * Instagram Graph API adapter — STUB.
 *
 * Required env: IG_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID.
 * Docs: https://developers.facebook.com/docs/instagram-api/
 *
 * Notes:
 *  - The account must be a Business or Creator account linked to a Facebook Page.
 *  - Use /{ig-user-id}/insights for follower_count, impressions, reach, profile_views.
 *  - Use /{ig-user-id}/media for posts; per-post insights via /{media-id}/insights.
 */
export function makeInstagramAdapter(): PlatformAdapter {
  const token = process.env.IG_ACCESS_TOKEN
  if (!token) throw new Error('IG_ACCESS_TOKEN is not set')

  return {
    meta: PLATFORM_META.instagram,
    source: 'live',
    async getOverview() {
      throw new Error('Instagram live adapter not yet implemented — set DEMO_MODE=true or implement this stub.')
    },
    async getTimeSeries() {
      throw new Error('Instagram live adapter not yet implemented.')
    },
    async getTopContent() {
      throw new Error('Instagram live adapter not yet implemented.')
    },
  }
}
