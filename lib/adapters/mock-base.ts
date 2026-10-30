import { eachDayOfInterval, formatISO } from 'date-fns'
import type {
  DateRange,
  OverviewMetrics,
  PlatformId,
  TimeSeriesPoint,
  ContentItem,
} from './types'

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return function rand() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Profile {
  baseFollowers: number
  baseImpressions: number
  baseEngagement: number
  postsPerDay: [number, number]
  followerGrowthPctRange: [number, number]
  contentTitles: string[]
}

const PROFILES: Record<PlatformId, Profile> = {
  x: {
    baseFollowers: 24_500,
    baseImpressions: 18_000,
    baseEngagement: 480,
    postsPerDay: [3, 8],
    followerGrowthPctRange: [-0.05, 0.4],
    contentTitles: [
      'Big product announcement thread',
      'Hot take on the latest industry shift',
      'Customer win story',
      'Behind the scenes — how we ship',
      'Live thread from the conference',
      'Hiring for two roles, deets inside',
      'Friday reflections from the team',
      'New blog post — read in 5 min',
    ],
  },
  youtube: {
    baseFollowers: 12_300,
    baseImpressions: 9_500,
    baseEngagement: 720,
    postsPerDay: [0, 1],
    followerGrowthPctRange: [-0.02, 0.6],
    contentTitles: [
      'How we built our analytics stack in 2 weeks',
      'Live coding: a Next.js dashboard from scratch',
      'Deep dive: shipping fast at scale',
      'Founder Q&A — one year in',
      'Tutorial: connecting the YouTube Data API',
      'Behind the launch: our biggest week ever',
    ],
  },
  linkedin: {
    baseFollowers: 8_900,
    baseImpressions: 14_200,
    baseEngagement: 540,
    postsPerDay: [1, 3],
    followerGrowthPctRange: [0.02, 0.5],
    contentTitles: [
      'We just hit 1,000 paying customers — here’s what we learned',
      'Why we open-sourced our reporting dashboard',
      'Hiring: Senior Engineer (remote)',
      '5 lessons from our first year',
      'Customer spotlight: Acme Co. saves 12 hours/week',
      'How we approach distributed product work',
    ],
  },
  instagram: {
    baseFollowers: 31_400,
    baseImpressions: 42_000,
    baseEngagement: 2_900,
    postsPerDay: [1, 2],
    followerGrowthPctRange: [-0.03, 0.45],
    contentTitles: [
      'Reel: a day in the life of our team',
      'Carousel — 7 charts that changed our roadmap',
      'New product photoshoot',
      'Reel: the launch that almost wasn’t',
      'Story takeover with our head of design',
      'Behind the scenes at our offsite',
    ],
  },
  tiktok: {
    baseFollowers: 18_700,
    baseImpressions: 96_000,
    baseEngagement: 7_400,
    postsPerDay: [1, 3],
    followerGrowthPctRange: [0.05, 1.2],
    contentTitles: [
      'POV: when the dashboard ships itself',
      'Day in the life of an indie SaaS founder',
      '3 hidden features in our launch',
      'Live demo: build a report in 60 seconds',
      'Why analytics dashboards are boring (and how we fixed it)',
      'Customer reaction — unscripted',
    ],
  },
}

function dayKey(d: Date): string {
  return formatISO(d, { representation: 'date' })
}

function jitter(rand: () => number, base: number, pct: number): number {
  const delta = base * pct * (rand() * 2 - 1)
  return Math.max(0, Math.round(base + delta))
}

export function buildMockTimeSeries(
  platform: PlatformId,
  range: DateRange,
): TimeSeriesPoint[] {
  const profile = PROFILES[platform]
  const days = eachDayOfInterval({ start: range.start, end: range.end })
  let followers = profile.baseFollowers

  return days.map((d) => {
    const rand = mulberry32(hashSeed(`${platform}:${dayKey(d)}`))
    const [minPct, maxPct] = profile.followerGrowthPctRange
    const growthPct = (minPct + rand() * (maxPct - minPct)) / 100
    followers = Math.round(followers * (1 + growthPct))
    const impressions = jitter(rand, profile.baseImpressions, 0.35)
    const engagement = jitter(rand, profile.baseEngagement, 0.45)
    return {
      date: dayKey(d),
      followers,
      impressions,
      engagement,
    }
  })
}

export function buildMockOverview(
  platform: PlatformId,
  range: DateRange,
): OverviewMetrics {
  const profile = PROFILES[platform]
  const series = buildMockTimeSeries(platform, range)
  const last = series[series.length - 1]
  const first = series[0]
  const impressions = series.reduce((s, p) => s + p.impressions, 0)
  const engagement = series.reduce((s, p) => s + p.engagement, 0)
  const rand = mulberry32(hashSeed(`${platform}:posts:${dayKey(range.end)}`))
  const days = series.length
  const [minP, maxP] = profile.postsPerDay
  const posts = Math.round(days * (minP + rand() * (maxP - minP)))
  return {
    followers: last.followers,
    followersDelta: last.followers - first.followers,
    impressions,
    engagement,
    posts,
  }
}

export function buildMockTopContent(
  platform: PlatformId,
  range: DateRange,
  n: number,
): ContentItem[] {
  const profile = PROFILES[platform]
  const rand = mulberry32(hashSeed(`${platform}:top:${dayKey(range.end)}`))
  const days = eachDayOfInterval({ start: range.start, end: range.end })
  const items: ContentItem[] = profile.contentTitles.map((title, i) => {
    const day = days[Math.floor(rand() * days.length)]
    const impressions = jitter(rand, profile.baseImpressions * 1.5, 0.6)
    const engagement = jitter(rand, profile.baseEngagement * 1.5, 0.7)
    return {
      id: `${platform}-${i}`,
      title,
      url: '#',
      publishedAt: dayKey(day),
      impressions,
      engagement,
      engagementRate: impressions === 0 ? 0 : (engagement / impressions) * 100,
    }
  })
  return items.sort((a, b) => b.impressions - a.impressions).slice(0, n)
}
