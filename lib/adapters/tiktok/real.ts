import type { PlatformAdapter } from '../types'
import { PLATFORM_META } from '../types'

/**
 * TikTok for Developers — STUB.
 *
 * Required env: TIKTOK_ACCESS_TOKEN.
 * Docs: https://developers.tiktok.com/doc/tiktok-api-v2-research-introduction
 *
 * Notes:
 *  - Use the Research API (requires application + approval) for org-level data.
 *  - The Display API works for own-account data with the user-context token.
 *  - Approval can take weeks. Leave creds blank to use mock until approved.
 */
export function makeTikTokAdapter(): PlatformAdapter {
  const token = process.env.TIKTOK_ACCESS_TOKEN
  if (!token) throw new Error('TIKTOK_ACCESS_TOKEN is not set')

  return {
    meta: PLATFORM_META.tiktok,
    source: 'live',
    async getOverview() {
      throw new Error('TikTok live adapter not yet implemented — set DEMO_MODE=true or implement this stub.')
    },
    async getTimeSeries() {
      throw new Error('TikTok live adapter not yet implemented.')
    },
    async getTopContent() {
      throw new Error('TikTok live adapter not yet implemented.')
    },
  }
}
