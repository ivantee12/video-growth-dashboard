import { formatNumber, formatPercent } from '@/lib/utils'
import { getBrand } from '@/lib/brand'
import type { DailyReport } from './build-daily'

export function buildDiscordPayload(report: DailyReport) {
  const brand = getBrand()
  const arrow = (dir: 'up' | 'down' | 'flat') => (dir === 'up' ? '▲' : dir === 'down' ? '▼' : '–')

  const fields = report.rows.map((r) => ({
    name: r.meta.name,
    value: `${formatNumber(r.yesterday.impressions)} impressions ${arrow(r.delta.dir)} ${formatPercent(Math.abs(r.delta.pct))} · ${formatNumber(r.yesterday.engagement)} eng · ${r.yesterday.posts} posts`,
    inline: false,
  }))

  return {
    content: `**${brand.name} daily report** — ${report.date}`,
    embeds: [
      {
        title: `Daily report · ${report.date}`,
        description: `Total impressions: **${formatNumber(report.total.impressions)}** ${arrow(report.totalDelta.dir)} ${formatPercent(Math.abs(report.totalDelta.pct))}\nEngagement rate: **${formatPercent(report.total.engagementRate)}**\nFollowers: **${formatNumber(report.total.followers)}**`,
        color: parseInt(brand.colors.primary.replace('#', ''), 16),
        fields,
        footer: { text: brand.reportFooter },
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

export async function sendToDiscord(report: DailyReport, webhookUrl: string): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildDiscordPayload(report)),
  })
  if (!res.ok) {
    throw new Error(`Discord webhook failed: ${res.status} ${res.statusText}`)
  }
}
