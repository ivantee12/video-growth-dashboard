import type { PlatformAdapter } from '../types'
import { PLATFORM_META } from '../types'

/**
 * LinkedIn Marketing Developer Platform adapter — STUB.
 *
 * Required env: LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORG_URN.
 * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/
 *
 * Notes:
 *  - Org analytics requires a Marketing Developer Platform partnership and
 *    r_organization_social + rw_organization_admin scopes.
 *  - Approval can take several weeks. Until then, leave creds blank to use mock.
 */
export function makeLinkedInAdapter(): PlatformAdapter {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  if (!token) throw new Error('LINKEDIN_ACCESS_TOKEN is not set')

  return {
    meta: PLATFORM_META.linkedin,
    source: 'live',
    async getOverview() {
      throw new Error('LinkedIn live adapter not yet implemented — set DEMO_MODE=true or implement this stub.')
    },
    async getTimeSeries() {
      throw new Error('LinkedIn live adapter not yet implemented.')
    },
    async getTopContent() {
      throw new Error('LinkedIn live adapter not yet implemented.')
    },
  }
}
