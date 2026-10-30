import { makeMockAdapter } from './mock'
import { makeXAdapter } from './x/real'
import { makeYouTubeAdapter } from './youtube/real'
import { makeLinkedInAdapter } from './linkedin/real'
import { makeInstagramAdapter } from './instagram/real'
import { makeTikTokAdapter } from './tiktok/real'
import { PLATFORM_IDS, type PlatformAdapter, type PlatformId } from './types'

const REAL_BUILDERS: Record<PlatformId, () => PlatformAdapter> = {
  x: makeXAdapter,
  youtube: makeYouTubeAdapter,
  linkedin: makeLinkedInAdapter,
  instagram: makeInstagramAdapter,
  tiktok: makeTikTokAdapter,
}

const REAL_CRED_ENV: Record<PlatformId, string> = {
  x: 'X_BEARER_TOKEN',
  youtube: 'YOUTUBE_API_KEY',
  linkedin: 'LINKEDIN_ACCESS_TOKEN',
  instagram: 'IG_ACCESS_TOKEN',
  tiktok: 'TIKTOK_ACCESS_TOKEN',
}

export function isPlatformConnected(id: PlatformId): boolean {
  if (process.env.DEMO_MODE === 'true') return false
  return Boolean(process.env[REAL_CRED_ENV[id]])
}

export function getAdapter(id: PlatformId): PlatformAdapter {
  if (isPlatformConnected(id)) {
    try {
      return REAL_BUILDERS[id]()
    } catch {
      return makeMockAdapter(id)
    }
  }
  return makeMockAdapter(id)
}

export function getAllAdapters(): PlatformAdapter[] {
  return PLATFORM_IDS.map(getAdapter)
}

export { PLATFORM_IDS, PLATFORM_META } from './types'
export type { PlatformAdapter, PlatformId } from './types'
