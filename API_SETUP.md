# Connect your accounts in VS Code

The app has server-side connectors for **Facebook Page videos**, **Instagram professional-account video media through Facebook Login**, and **TikTok public videos**. You must authorize your own accounts through each platform's developer tools first. No account is connected simply because its logo appears.

This version uses tokens you obtain from the official developer dashboards. A built-in “Sign in with Facebook/TikTok” OAuth flow and automatic token renewal are not implemented. Never paste a token or password into chat, a screenshot, Git, or a public website.

## 1. Upgrade your local database

Open the project folder in VS Code. Choose **Terminal → New Terminal** (PowerShell), stop the app with Ctrl + C if it is running, and run:

```powershell
npm.cmd run db:migrate
```

Success: `Local PostgreSQL schema is ready (version 2).` Existing videos and snapshots are retained. This adds a metric label so the app can distinguish different view-count definitions. Continue using your local PostgreSQL database configured in `.env.local`.

## 2. Open your local settings file

Click `.env.local` in VS Code's Explorer panel. Keep your existing DATABASE_URL. Add the following variables and fill in ONLY the platforms you want to connect:

```dotenv
# Keep your existing local DATABASE_URL and password unchanged.
NEXT_TELEMETRY_DISABLED=1

# Use a currently supported version shown in your Meta app dashboard.
META_GRAPH_VERSION=v26.0
FB_PAGE_ID=
FB_PAGE_ACCESS_TOKEN=
IG_ACCOUNT_ID=
IG_ACCESS_TOKEN=
TIKTOK_OPEN_ID=
TIKTOK_ACCESS_TOKEN=
```

Each variable should occur only once. The v26.0 value is an example configuration; check the supported version in your Meta dashboard. Token values go after `=`. Do not add `Bearer ` before a token. These tokens stay in `.env.local` on the local server; the Connections page receives only account IDs and configuration status.

## 3. Facebook: your Page's videos

This connector is for a **Facebook Page you manage**. Personal-profile video analytics are not implemented.

1. Open [Meta for Developers](https://developers.facebook.com/apps/) and create or open your developer app.
2. Configure the Facebook Login/Pages use case required by Meta for your app. In development mode, use an account and Page that have the required app roles/access. Access beyond development/test roles may require app review and business verification.
3. Use Meta's [Graph API Explorer](https://developers.facebook.com/tools/explorer/) to obtain an authorized **User Access Token** for the Page discovery step. The connector does not perform this authorization flow for you.
4. Request the approved permissions applicable to the endpoints. These commonly include `pages_show_list`, `pages_read_engagement` and `read_insights`; Video Insights may require additional permissions such as `pages_manage_engagement` depending on Meta's current requirements. Check the official [Video Insights reference](https://developers.facebook.com/docs/graph-api/reference/video/video_insights/) for the version you use. The app itself only reads data; it does not publish, comment or modify your Page.
5. In the Explorer, make a **GET** request to `me/accounts?fields=id,name,access_token`. This can return Pages your user is permitted to access. Keep the returned tokens private.
6. Find your Page in the response. Copy its `id` into `FB_PAGE_ID` and that Page's `access_token` into `FB_PAGE_ACCESS_TOKEN` in `.env.local`.
7. Save with Ctrl + S, restart the app, and use **Connections → Sync facebook now**.

The connector first calls `me?fields=id` using the Page token and checks that the result matches FB_PAGE_ID. It then paginates `/{page-id}/videos` and reads `/{video-id}/video_insights?metric=total_video_views&period=lifetime` for the returned videos. Only lifetime counts for that exact metric are stored. Missing counts are skipped; permission/unsupported-metric errors fail the sync without saving a partial batch.

**Coverage:** only videos returned by the Page `/videos` edge are discovered. A separate discovery connector for Reels not returned by that edge, personal profiles, Stories and ads is not implemented. Meta may withhold insights for some videos or restrict an endpoint/metric for your Page, permissions or Graph version. This integration has fixture tests but has not been verified with your live account.

## 4. Instagram: your professional account

This implementation uses **Instagram API with Facebook Login**. Your Instagram account must be Business/Creator and linked to a Facebook Page. The separate Instagram Login token/host flow is not implemented. Meta documents this account model in its [official Instagram API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api).

1. In your Meta app, configure Instagram access through Facebook Login for the linked professional account.
2. Obtain an approved Facebook **User Access Token** with the permissions needed for your account. Typically the relevant permissions include `instagram_basic`, `instagram_manage_insights`, `pages_show_list` and `pages_read_engagement`; consult Meta's current requirements for your app and business access model. Development/test roles and app review rules still apply.
3. In Graph API Explorer, using that User Access Token, make a **GET** request to `me/accounts?fields=id,name,instagram_business_account`. If there are more Pages, follow pagination in the Explorer.
4. Find the Page linked to your Instagram account. Copy `instagram_business_account.id` into `IG_ACCOUNT_ID`. This is the Instagram account ID, not the Page ID or Instagram username.
5. Put your authorized **User Access Token** into `IG_ACCESS_TOKEN`. Do not use a token from the unrelated Instagram Login flow.
6. Save `.env.local`, restart the app, and use **Connections → Sync instagram now**.

The connector lists `/{ig-account-id}/media`, keeps media with `media_type=VIDEO`, and reads `/{media-id}/insights?metric=views`. It supports lifetime values returned in `values[0].value` or `total_value.value`. Image posts, carousel children, Stories, ads, and cross-platform combined Facebook+Instagram totals are not collected by this connector. A denied or unsupported metric fails the sync; it is never replaced with likes or impressions.

References: [Meta media insights](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-media/insights/) and [Meta insights guide](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/insights/). Meta documentation pages were rate-limited/inaccessible from the build environment, so current endpoint/permission compatibility still needs confirmation using your approved live token.

## 5. TikTok: your public videos

1. Open [TikTok for Developers](https://developers.tiktok.com/) and create/open an app.
2. Configure **Login Kit** and **Display API**, following the official [Display API getting started guide](https://developers.tiktok.com/doc/display-api-get-started/). Configure a redirect URL accepted by TikTok for your app; this dashboard does not provide an OAuth callback endpoint.
3. Obtain approval or the applicable test/sandbox access for `user.info.basic` and `video.list`.
4. Complete the official OAuth flow for your own TikTok account through your approved app or developer tooling. Keep the `access_token` and the authorized user's `open_id` from the token response.
5. Put those values into `TIKTOK_ACCESS_TOKEN` and `TIKTOK_OPEN_ID` in `.env.local`.
6. Save, restart the app, and use **Connections → Sync tiktok now**.

The connector checks the token owner's `open_id` using `/v2/user/info/?fields=open_id`. It then uses `/v2/video/list/` with `video.list`, paginates in batches of 20, and stores `view_count`. Only the authorized user's public videos returned by this endpoint are available. Expired tokens must be renewed using TikTok's approved token flow and replaced locally; this app does not refresh tokens automatically.

Official references: [user info](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info/), [list videos](https://developers.tiktok.com/doc/tiktok-api-v2-video-list/), [video object fields](https://developers.tiktok.com/doc/tiktok-api-v2-video-object/).

## 6. Xiaohongshu

Use CSV imports from your own creator analytics exports or manually recorded view counts. The [official public scopes documentation](https://openaccount.xiaohongshu.com/docs/scope) currently lists `basic_info` as available and post-reading access as planned; it does not document general creator video-view access. No unofficial scraping or automatic Xiaohongshu video connector is included.

## 7. Start and sync

In VS Code's terminal:

```powershell
npm.cmd run dev
```

Open [the Connections page](http://127.0.0.1:3000/settings). Each platform displays:

- **Setup required:** a required variable is missing/invalid. Add the listed variables and restart the app.
- **Configured · ready to verify with a sync:** variables are present; this does not yet prove the token is valid.
- **Snapshots saved:** the button response confirms that this sync collected data and wrote it to PostgreSQL.

Click the appropriate sync button, wait for the result, then open the dashboard. The first sync starts historical tracking; it cannot recover view counts for dates before collection began. Sync roughly every 24 hours for daily comparisons and continue for at least seven days for weekly comparisons. Scheduling is not included yet.

## Categories and CSV data

API syncs preserve your existing category labels. New videos start as Uncategorized. To set categories, prepare CSV rows with the same platform, API account ID, and platform video ID; use the latest capture time and count shown in the dashboard history, edit the category, and re-import. Future API syncs keep the edited category. A CSV re-import can overwrite an existing timestamp's metric label; subsequent API snapshots start/continue the API metric history.

The API stores account IDs as account keys. If an earlier CSV used a nickname, those are separate records. Use the same account ID consistently to avoid counting a video twice. No automatic nickname-to-ID merge is implemented.

Each API has its own metric label: `facebook:total_video_views`, `instagram:views`, or `tiktok:view_count`. CSV rows use `views`. Growth requires matching endpoint and baseline labels, so switching data source can temporarily show an em dash until enough matching history exists. View definitions also differ between platforms; category comparisons across platforms should be interpreted with that in mind.

## Limits and common errors

| Message | Next step |
| --- | --- |
| Database not ready | Run `npm.cmd run db:migrate` and verify local PostgreSQL is running. |
| Setup required | Check the variable names in `.env.local`, save, and restart. |
| Token invalid or expired / authorization rejected | Reauthorize using the official platform tools; replace the token locally and restart. |
| Token does not belong to the configured account | Use the account ID and token from the same authorized account. For Facebook, use a Page token, not the initial User token. |
| Platform rejected the request | Verify account type, approved scopes and Graph version/metric support. Raw platform errors are not displayed because they may contain secrets. No partial batch is saved. |
| Platform rate limit | Wait before retrying. The app adds a one-minute pause between attempts. |
| No usable video views | The authorized account may have no supported/public videos, or the API omitted the lifetime count. Skipped counts are never stored as zero. |
| Sync limit reached | Current limits are 1,000 listed items, 50 pages, 20 seconds per request and two minutes for collection. Exceeding a limit fails the collection without saving partial results; use CSV for larger histories. |

One configured account per API platform is supported. Syncs are manual. OAuth UI, refresh-token storage, background scheduling, separate Facebook Reels discovery and live-account verification are remaining work. Platform icons are local display artwork; they do not indicate account authorization or endorsement.
