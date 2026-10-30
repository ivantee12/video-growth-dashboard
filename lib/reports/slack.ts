import { formatNumber, formatPercent } from '@/lib/utils'
import { getBrand } from '@/lib/brand'
import type { DailyReport } from './build-daily'

export function buildSlackPayload(report: DailyReport) {
  const brand = getBrand()
  const arrow = (dir: 'up' | 'down' | 'flat') =>
    dir === 'up' ? ':chart_with_upwards_trend:' : dir === 'down' ? ':chart_with_downwards_trend:' : ':left_right_arrow:'

  const rowLines = report.rows.map((r) => {
    return `• *${r.meta.name}* — ${formatNumber(r.yesterday.impressions)} impressions ${arrow(r.delta.dir)} ${formatPercent(Math.abs(r.delta.pct))} · ${formatNumber(r.yesterday.engagement)} engagements · ${r.yesterday.posts} posts`
  })

  return {
    text: `${brand.name} daily report — ${report.date}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${brand.name} — Daily report (${report.date})` },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Total impressions*\n${formatNumber(report.total.impressions)} ${arrow(report.totalDelta.dir)} ${formatPercent(Math.abs(report.totalDelta.pct))}` },
          { type: 'mrkdwn', text: `*Engagement rate*\n${formatPercent(report.total.engagementRate)}` },
          { type: 'mrkdwn', text: `*Followers*\n${formatNumber(report.total.followers)}` },
          { type: 'mrkdwn', text: `*Posts*\n${report.total.posts}` },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: rowLines.join('\n') },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: brand.reportFooter }],
      },
    ],
  }
}

export async function sendToSlack(report: DailyReport, webhookUrl: string): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildSlackPayload(report)),
  })
  if (!res.ok) {
    throw new Error(`Slack webhook failed: ${res.status} ${res.statusText}`)
  }
}
