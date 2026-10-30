# Livedashboard

> A universal social media analytics dashboard with **automated daily reporting** across X, YouTube, LinkedIn, Instagram, and TikTok — open-source and brandable for your business.

Built with Next.js 15, TypeScript, Tailwind CSS, and Recharts. Self-hostable on Vercel in a few clicks.

---

## What it does

- **One dashboard, five platforms.** Aggregate KPI cards, daily time-series charts, and per-platform deep dives for X, YouTube, LinkedIn, Instagram, and TikTok.
- **Automated daily reporting.** A scheduled job builds a daily summary every morning and posts it to Slack and/or Discord. View the same report in-app and print/save it as a branded PDF.
- **Demo mode out of the box.** Realistic, deterministic mock data ships with the app, so the dashboard is fully usable the moment you clone it — no API keys required.
- **Pluggable real APIs.** Each platform has a clean adapter interface. Drop your credentials into `.env.local` to switch a platform from demo to live.
- **Custom branding.** One file (`brand.config.ts`) controls your name, logo, and colors across the dashboard, the daily report, and the Slack/Discord messages.

## Live demo

A public demo is deployed on Vercel: **(set this once you deploy — see "Deploy" below)**.

The demo runs in `DEMO_MODE=true`, so all platforms show seeded mock data. It's safe to share publicly.

## Screenshots

Add your own screenshots to `public/screenshots/` and they will appear here:

- `public/screenshots/overview.png` — overview page with KPIs and 5 platform tiles
- `public/screenshots/platform.png` — per-platform deep dive
- `public/screenshots/report.png` — daily report (printable / PDF-ready)
- `public/screenshots/slack.png` — example Slack delivery

## Features

- 5 platform adapters (X, YouTube, LinkedIn, Instagram, TikTok)
- Mock data + pluggable real adapter pattern (`lib/adapters/*`)
- Daily report with day-over-day deltas, in-dashboard view, and PDF print styles
- Slack Block Kit and Discord embed delivery (`lib/reports/slack.ts`, `lib/reports/discord.ts`)
- Vercel Cron-driven daily delivery (`vercel.json` + `app/api/cron/daily/route.ts`)
- Brand customization via `brand.config.ts` + env-var overrides + a `/settings` live preview panel
- Settings page showing connection status per platform
- TypeScript-strict, lint-clean, zero-runtime-deps for branding (just CSS variables)

---

## Prerequisites

- **Node.js 20+** (Node 22 recommended)
- **npm** (or pnpm / yarn — npm is what the README assumes)
- A platform-by-platform API account if you want **live** data (each is optional — leave blank to use mock):
  - **X (Twitter):** developer account at <https://developer.x.com>
  - **YouTube:** API key from <https://console.cloud.google.com> (enable YouTube Data API v3)
  - **LinkedIn:** Marketing Developer Platform access at <https://learn.microsoft.com/en-us/linkedin/marketing/>
  - **Instagram:** Business/Creator account + Facebook Page + Graph API token (<https://developers.facebook.com/docs/instagram-api/>)
  - **TikTok:** developer account at <https://developers.tiktok.com> (Research API requires application + approval)
- A **Slack** or **Discord** webhook URL if you want automated daily delivery (both are optional)

## Quickstart (demo mode — zero setup)

```bash
git clone <your fork>
cd Livedashboard
npm install
cp .env.example .env.local       # optional — defaults work fine for the demo
npm run dev
```

Open <http://localhost:3000>. Every platform will show realistic mock data.

## Connecting real data

Open `.env.local` (created from `.env.example`) and fill in only the platforms you want live:

| Platform   | Env var(s)                                          | Notes |
|------------|-----------------------------------------------------|-------|
| X          | `X_BEARER_TOKEN`, `X_USER_ID`                       | Free tier rate-limits aggressively. |
| YouTube    | `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`             | Watch-time requires the Analytics API + OAuth. |
| LinkedIn   | `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORG_URN`         | Requires MDP partnership — approval can take weeks. |
| Instagram  | `IG_ACCESS_TOKEN`, `IG_BUSINESS_ACCOUNT_ID`         | Requires a Business/Creator account + linked Facebook Page. |
| TikTok     | `TIKTOK_ACCESS_TOKEN`                               | Research API needs an approved application. |

Any platform with missing credentials silently falls back to mock data. The `/settings` page shows which platforms are LIVE vs DEMO.

> **Implementing the live adapters.** This repo ships with **stub** real adapters in `lib/adapters/<platform>/real.ts`. Each file documents the official API endpoints to call. Open a PR if you implement one — the contract is just `getOverview / getTimeSeries / getTopContent` (see [`lib/adapters/types.ts`](lib/adapters/types.ts)).

## Customizing your brand

This is the bit that makes the dashboard feel like *yours*, not a template.

1. Edit [`brand.config.ts`](brand.config.ts):

   ```ts
   export const brand = {
     name: 'Acme Co.',
     tagline: 'Daily social analytics for the team.',
     logo: { light: '/brand/logo-light.svg', dark: '/brand/logo-dark.svg' },
     favicon: '/brand/favicon.svg',
     colors: {
       primary: '#0F62FE',
       accent:  '#FF6B35',
       bg:      '#0B0F19',
       surface: '#111827',
       border:  '#1F2937',
       fg:      '#F9FAFB',
       muted:   '#9CA3AF',
     },
     reportFooter: 'Confidential — generated by Acme Co.',
   } as const
   ```

2. Replace the assets in [`public/brand/`](public/brand/) with your own SVG/PNG logo and favicon.

3. Restart the dev server (or redeploy). Your brand cascades through:
   - the navigation bar
   - every KPI card and chart accent
   - the daily report header + footer
   - the Slack and Discord daily messages

**Want to test colors before committing?** Open `/settings` → "Branding preview" and tweak in real time. Changes only affect your browser. When you're happy, commit them to `brand.config.ts`.

**Branding via env vars (no fork required).** On Vercel you can override `BRAND_NAME`, `BRAND_PRIMARY`, and `BRAND_ACCENT` per deployment.

## Daily reports

Three ways to deliver:

1. **In-dashboard:** open `/report` for yesterday's metrics. Click **Print / save as PDF** for a branded PDF.
2. **Manual webhook send:** click **Send to Slack** or **Send to Discord** on `/report`.
3. **Automated daily delivery:** Vercel Cron triggers `/api/cron/daily` once a day.

Configure these env vars to enable automatic delivery:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXX/YYY
CRON_SECRET=some-long-random-string
```

The cron schedule lives in [`vercel.json`](vercel.json) (default: 09:00 UTC). Edit the cron expression to match your timezone.

## Deploy

The fastest path is Vercel:

1. Push your fork to GitHub.
2. Import the repo at <https://vercel.com/new>.
3. Set the env vars (at minimum `DEMO_MODE=true` for a public demo, or your platform credentials for real data).
4. Deploy.

Then paste the URL into the **Live demo** section above (and into your LinkedIn post).

## Project structure

```
app/
  layout.tsx                 wires brand colors as CSS variables
  page.tsx                   overview
  platform/[id]/page.tsx     per-platform deep dive
  report/page.tsx            daily report (printable)
  settings/page.tsx          connection status + branding preview
  api/
    metrics/[platform]/      JSON metrics endpoint
    report/send/             POST to manually send a report
    cron/daily/              Vercel Cron entry point
components/                  UI: nav, KPI card, platform tile, charts, send buttons
lib/
  adapters/                  PlatformAdapter interface + mock + 5 real-adapter stubs
  metrics/aggregate.ts       cross-platform aggregation
  reports/                   build-daily.ts + slack.ts + discord.ts
  brand.ts                   resolves brand.config.ts + env overrides
  utils.ts, date.ts
brand.config.ts              SINGLE source of truth for branding
public/brand/                logo + favicon assets
.env.example                 every supported credential
vercel.json                  daily cron
```

## FAQ

**Why mock data first?** Three of the five platforms (TikTok, IG Graph, LinkedIn org analytics) require business-account approval that can take weeks. Mock-first means the dashboard is useful — and the demo is shareable — on day one.

**Can I add my own platform?** Yes. Implement the [`PlatformAdapter`](lib/adapters/types.ts) interface in `lib/adapters/<your-platform>/`, register it in `lib/adapters/index.ts`, and add an entry to `PLATFORM_META`. Everything else (overview tile, deep-dive page, daily report row, webhook payload) is generated automatically.

**Does it store any data?** No. Every page is a server component that reads live (or mock) data on each request. There is no database. If you need historical retention, wire a database into the adapter layer.

**Is it production-ready?** It's a solid starter. For multi-tenant SaaS use cases you'll want auth, per-tenant credential storage, and rate-limit caching on top of the adapter layer.

## License

MIT — see [LICENSE](LICENSE).
