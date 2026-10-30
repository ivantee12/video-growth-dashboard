import { buildMockOverview, buildMockTimeSeries, buildMockTopContent } from './mock-base'
import { PLATFORM_META, type PlatformAdapter, type PlatformId } from './types'

export function makeMockAdapter(id: PlatformId): PlatformAdapter {
  return {
    meta: PLATFORM_META[id],
    source: 'mock',
    async getOverview(range) {
      return buildMockOverview(id, range)
    },
    async getTimeSeries(range) {
      return buildMockTimeSeries(id, range)
    },
    async getTopContent(range, n) {
      return buildMockTopContent(id, range, n)
    },
  }
}
