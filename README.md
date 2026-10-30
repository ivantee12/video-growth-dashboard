# Video Growth Dashboard

A self-hosted adaptation of https://github.com/dizzyx/daily-social-report (MIT; upstream license retained). The original Next.js, Tailwind and branding foundation is retained. The home screen and settings now use a PostgreSQL-backed video workflow. Original documentation is in UPSTREAM_README.md and describes the upstream project, not this MVP.

## Preview and project status

A working self-hosted MVP for tracking your own videos with a **local PostgreSQL database**. CSV imports, video/category comparisons, historical snapshots, platform logos and manual API sync connectors are implemented. API syncs require your own approved tokens; no live accounts are included or preconnected. Xiaohongshu is CSV-only. See [API setup](API_SETUP.md) and [verification results](VERIFICATION.md) for the tested scope and remaining work.

![Video Growth dashboard with fictional example videos](docs/screenshots/dashboard.png)

![Platform connection setup](docs/screenshots/connections.png)

Screenshots use fictional sample data only. This repository contains the application source and setup instructions; GitHub does not host a running copy of this database-backed app.

## Get the code

```powershell
git clone https://github.com/ivantee12/video-growth-dashboard.git
Set-Location video-growth-dashboard
```

Open this folder in VS Code, then follow the numbered **Windows + pgAdmin** guide below. Your database and API secrets belong in your own `.env.local`; they are not included in the repository.

## Implemented

- Facebook, Instagram, TikTok and Xiaohongshu CSV snapshots for your own accounts.
- Local PostgreSQL storage: videos identified by platform + account + video_id; timestamped cumulative view counts.
- Atomic validated imports, safe repeat imports, correction of counts at an existing timestamp, category labels and Unicode text.
- Platform/account/category filters; video ranking by views or growth; 24h and 7d absolute and percentage change.
- Category average and total growth, with measured/total video coverage; per-video snapshot history and video links.
- Clear empty/error states. No automatically generated demo data. The downloadable CSV is explicitly fictional sample data.

## API connectors and logos (new)

Facebook Page videos, Instagram video media (professional accounts through Facebook Login), and TikTok public-video connectors are implemented with manual sync buttons on **Connections**. Platform icons and a new Video Growth app logo are shown locally. You need approved API tokens before live data can be collected; no accounts have been authorized by this code change.

**Existing users:** run `npm.cmd run db:migrate` to upgrade to schema version 2, then follow [API_SETUP.md](API_SETUP.md) in VS Code. It covers token configuration, supported content, permissions, syncs, and remaining limits. Xiaohongshu remains CSV-only. Built-in OAuth sign-in, token renewal and scheduled collection are not implemented.

## Start here: Windows + pgAdmin (beginner guide)

Follow steps 1–8 in order. Since you are using pgAdmin, use this section. Docker is an optional alternative further down; you do not need both.

### What the different programs do

| Name | What it does |
| --- | --- |
| PostgreSQL | The database service running on your PC. It stores your videos and view counts. |
| pgAdmin | A window for managing PostgreSQL. Installing pgAdmin alone does not create a PostgreSQL server. |
| Video Growth dashboard | The web app you open in your browser. It connects directly to PostgreSQL. |
| PowerShell | The Windows terminal where you run the dashboard commands below. |

Your setup will be: **browser → dashboard on your PC → PostgreSQL on your PC**. pgAdmin lets you inspect the same database. No cloud database is required.

You will use two database accounts: `postgres` is the administrator you use for initial setup; `video` is the separate login you will create for this app. A pgAdmin master password, if requested, unlocks saved passwords in pgAdmin; it is separate from these PostgreSQL account passwords.

### 1. Check that PostgreSQL is installed and running

1. Open **pgAdmin 4**.
2. In the left panel, expand **Servers**.
3. If you see something like **PostgreSQL 17** or **PostgreSQL 18**, double-click it to connect. Your version/name may differ.
4. If asked for the password for user `postgres`, enter the password you chose when installing PostgreSQL.
5. If you can expand the server and see **Databases** and **Login/Group Roles**, continue to step 2.

**If Servers is empty**, PostgreSQL may simply not be registered in pgAdmin. Check Windows first:

1. Press **Windows + R**, type `services.msc`, and press Enter.
2. Look for a service whose name includes `postgresql` (for example, `postgresql-x64-17`).
3. If present but stopped, right-click it and choose **Start**. Windows may request administrator access.
4. If there is no PostgreSQL service and you have not installed PostgreSQL, use the [official Windows installer page](https://www.postgresql.org/download/windows/). The installer linked there includes the PostgreSQL server and pgAdmin. Keep **PostgreSQL Server** selected, record the administrator password you choose, and note the port (normally `5432`). You do not need Stack Builder add-ons for this app.

To register an existing local server in pgAdmin:

1. Right-click **Servers → Register → Server…**. This saves a connection; it does not install a server.
2. Under **General**, enter a friendly name such as `My local PostgreSQL`.
3. Under **Connection**, enter:

| Field | Value |
| --- | --- |
| Host name/address | `127.0.0.1` |
| Port | `5432`, or the port chosen during installation |
| Maintenance database | `postgres` |
| Username | `postgres` |
| Password | Your PostgreSQL administrator password |

Click **Save**. If it fails, use the troubleshooting table below before continuing. These fields are described in the [official pgAdmin server guide](https://www.pgadmin.org/docs/pgadmin4/latest/server_dialog.html).

### 2. Create the dashboard login: video

Do these clicks inside the connected server in pgAdmin:

1. Find **Login/Group Roles** in the left panel.
2. Right-click it → **Create → Login/Group Role…**.
3. On the **General** tab, set **Name** to `video` (all lowercase).
4. On the **Definition** tab, enter a new password of your own. Save it somewhere private; you will use it again in step 5.
5. On the **Privileges** tab, set **Can login?** to **Yes**. Leave **Superuser**, **Create roles**, and **Create databases** off.
6. Click **Save**.

Use a long, unique password. Letters and numbers are easiest to enter into the connection URL; if you use symbols, see the password note in step 5. Do not use your Facebook/Instagram/TikTok password.

If `video` already exists from an earlier attempt, open its **Properties** instead. Check **Can login?** and set a password you know; you do not need to recreate it. See the [official pgAdmin role guide](https://www.pgadmin.org/docs/pgadmin4/latest/role_dialog.html) for the dialog fields.

### 3. Create the database: video_growth

1. In the same server, right-click **Databases → Create → Database…**.
2. On the **General** tab, set:

| Field | Value |
| --- | --- |
| Database | `video_growth` |
| Owner | `video` |

3. Under **Definition**, keep **Encoding** as `UTF8` so Chinese titles and other Unicode text work. Leave the remaining settings at their defaults.
4. Click **Save**.
5. If it does not appear immediately, right-click **Databases → Refresh**.

You should now see `video_growth` listed. It is normal for it to have no application tables yet; step 6 creates them. If the database already exists, check its **Properties → Owner** rather than deleting it. See the [official pgAdmin database guide](https://www.pgadmin.org/docs/pgadmin4/latest/database_dialog.html).

### 4. Open the project in VS Code

Use **VS Code** to edit files and run the app. Continue using **pgAdmin** for database setup in steps 1–3 and to inspect saved data. PostgreSQL must still be running on your PC.

Open the folder where you cloned or downloaded this repository. For example:

```text
C:\Projects\video-growth-dashboard
```

1. Open **Visual Studio Code**.
2. Choose **File → Open Folder…** and select your project folder (the example location above can be different on your PC). Open `video-growth-dashboard` itself, so `package.json` and `README.md` appear directly in the Explorer panel.
3. Choose **Terminal → New Terminal**. A terminal opens at the bottom of VS Code.
4. Use **PowerShell** for the commands in this guide. If the terminal uses another shell, use the terminal dropdown to select a PowerShell terminal.
5. Paste the following into the terminal. If your folder is elsewhere, replace the first line with your actual project path:

```powershell
Set-Location 'C:\Projects\video-growth-dashboard'
node --version
npm.cmd --version
```

If Node.js or npm is not recognized, install a supported Node.js LTS release with npm included, then fully close and reopen VS Code. This app requires Node.js 20 or newer; the project was verified with Node.js 24. These commands are for **VS Code's PowerShell terminal**, not pgAdmin's Query Tool. No VS Code extensions are required to run the app.

Install the app's packages:

```powershell
npm.cmd install
```

Wait until it finishes. `npm.cmd` is npm's Windows launcher and avoids PowerShell script execution-policy errors. If you already use pnpm 11, `pnpm install --frozen-lockfile` installs the exact package versions verified for this project instead.

### 5. Tell the app how to connect

In the same VS Code terminal, create the settings file if it does not already exist:

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

In VS Code's left **Explorer** panel, click `.env.local`. If it has not appeared, refresh Explorer. Set its contents to the following, replacing `YOUR_VIDEO_PASSWORD` with the password you created for **video** in step 2:

```dotenv
DATABASE_URL=postgresql://video:YOUR_VIDEO_PASSWORD@127.0.0.1:5432/video_growth
NEXT_TELEMETRY_DISABLED=1
```

Press **Ctrl + S** to save. The file must be called **.env.local**, not `.env.local.txt`, and must be beside `package.json`.

Here is how the database address maps to your settings:

| Part | Meaning |
| --- | --- |
| `postgresql://` | Connection type; leave this as shown |
| `video` | The login you created in step 2 |
| `YOUR_VIDEO_PASSWORD` | That login's password, not the administrator or pgAdmin master password |
| `127.0.0.1` | This Windows PC |
| `5432` | Your PostgreSQL port; change it if your installation uses another port |
| `video_growth` | The database you created in step 3 |

**Password symbols:** special characters in the password must be URL-encoded in this file. For example, a password containing `@` uses `%40` in its place; `#` becomes `%23`, `%` becomes `%25`, `/` becomes `%2F`, `:` becomes `%3A`, and `?` becomes `%3F`. Keep the actual password unchanged in pgAdmin. Only the URL version is encoded. Do not include the literal `YOUR_VIDEO_PASSWORD` placeholder.

This file stays on your PC and is excluded from Git. Keep it private. You do not need to share your password to get help; redact it from any error messages or screenshots.

### 6. Create the app's tables

Return to VS Code's terminal, still inside the project folder, and run:

```powershell
npm.cmd run db:migrate
```

This command connects as `video` and creates the tables automatically. You do not need to write SQL or manually create columns in pgAdmin.

**Success looks like:**

```text
Local PostgreSQL schema is ready (version 2).
```

To confirm in pgAdmin, expand:

```text
Servers
  Your local PostgreSQL server
    Databases
      video_growth
        Schemas
          public
            Tables
```

Right-click **Tables → Refresh**. You should see:

| Table | What it stores |
| --- | --- |
| `videos` | Video titles, account names, platform IDs and category labels |
| `snapshots` | View counts recorded at specific times |
| `schema_migrations` | The database setup version |

Running `db:migrate` again is safe for this MVP; it does not erase your existing videos. If it fails, stop here and check troubleshooting before starting the dashboard.

### 7. Start the dashboard and try an import

In VS Code's terminal:

```powershell
npm.cmd run dev
```

Wait for the ready message, then open **[http://127.0.0.1:3000](http://127.0.0.1:3000)** in your browser. You can also Ctrl + click the address printed in the terminal. Keep VS Code and the terminal running while using the app. If the terminal reports a different port because 3000 is busy, use the address it prints. The app runs as a Next.js server; you do not need the Live Server extension.

- An empty dashboard is expected before your first import.
- A yellow **Local database is not ready** message means the connection or table setup still needs fixing.
- The **Download example CSV** link provides fictional data for learning the import process. The **First import** section below explains its contents; you can also start directly with your own CSV.

After importing, inspect the data in pgAdmin: right-click `videos` or `snapshots` → **View/Edit Data → All Rows**. Use this to check what was saved. Make category/count changes through CSV re-imports while learning, so you keep the import validation.

### 8. Open it again next time

The database setup is a one-time process. On later days:

1. Make sure the PostgreSQL Windows service is running. You do not need to keep pgAdmin open.
2. Open the project folder in VS Code and choose **Terminal → New Terminal** as in step 4.
3. Run `npm.cmd run dev`.
4. Open the dashboard address in your browser.

Press **Ctrl + C** in the terminal to stop the dashboard. Stopping the dashboard or closing pgAdmin does not delete stored data. Restart the dashboard after changing `.env.local`.

### Common setup problems

| What you see | What to check |
| --- | --- |
| pgAdmin asks for a master password | This unlocks pgAdmin's saved credentials. It is separate from the PostgreSQL `postgres` and `video` passwords. |
| Connection refused / `ECONNREFUSED` | Start the PostgreSQL Windows service; check host `127.0.0.1` and the port. pgAdmin alone is not the database service. |
| Password authentication failed for user `postgres` | Use the PostgreSQL administrator password chosen during installation. If forgotten, use the password recovery process for your PostgreSQL installation; do not reinstall/delete your data just to retry this guide. |
| Password authentication failed for user `video` | In pgAdmin, open **Login/Group Roles → video → Properties → Definition** and set a known password. Update `.env.local` to match, including URL-encoding symbols. |
| Role `video` does not exist / is not permitted to log in | Complete step 2; ensure **Can login? = Yes**. Check you created it on the server/port used by the app. |
| Database `video_growth` does not exist | Complete step 3 on the same server/port used in `.env.local`. |
| Permission denied for schema `public` | Check **video_growth → Properties → Owner** is `video`. If an existing database still restricts schema creation, ask for help with that exact error before changing broader permissions. |
| Relation `videos` does not exist / dashboard says database not ready | Run `npm.cmd run db:migrate` from the project folder and check it reports success. |
| `DATABASE_URL` is not configured | Check `.env.local` is beside `package.json`, is saved, and is not named `.env.local.txt`. Restart the dashboard. |
| `npm` not recognized / `npm.ps1 cannot be loaded` | Reopen the terminal after installing Node.js; use the `npm.cmd` commands above. |
| App says the database is ready but pgAdmin shows no tables | Refresh **Schemas → public → Tables**; verify you are viewing `video_growth` on the same host/port. |

If you need help, share the exact error text and which numbered step you reached, with passwords removed.

### Optional: production mode

After the development setup works, you can build and run an optimized version:

```powershell
npm.cmd run build
npm.cmd start
```

Stop the development server with Ctrl + C before starting production mode. Both launch scripts bind to `127.0.0.1`. This personal MVP has no login; keep it local and add authentication before exposing it publicly.

### Alternative: Docker PostgreSQL (skip if using the pgAdmin setup above)

Use this only if you prefer Docker rather than a Windows PostgreSQL installation. Install/start Docker Desktop with Linux containers enabled. In the project folder:

```powershell
Copy-Item .env.docker.example .env
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
notepad .env
notepad .env.local
```

Set `POSTGRES_PASSWORD` in `.env` to a password you choose. Set `.env.local` to use the same password (URL-encoded if needed):

```dotenv
DATABASE_URL=postgresql://video:YOUR_VIDEO_PASSWORD@127.0.0.1:5432/video_growth
NEXT_TELEMETRY_DISABLED=1
```

Then run:

```powershell
docker compose up -d --wait
npm.cmd install
npm.cmd run db:migrate
npm.cmd run dev
```

The container creates the `video` login and `video_growth` database automatically on its first start with an empty data volume. The `.env` password setting does not reset a password in an existing volume. If Windows PostgreSQL already uses port 5432, change the compose host mapping to `127.0.0.1:5433:5432` and use `5433` in DATABASE_URL.

You can register this Docker database in pgAdmin with host `127.0.0.1`, the chosen host port, maintenance database `video_growth`, username `video`, and the password from `.env`. PostgreSQL data persists in the `video_pgdata` volume. `docker compose stop` stops the container without deleting that data.

## First import

Download `sample-videos.csv` from the dashboard, or use `public/sample-videos.csv`. Import it using **Choose CSV**. It contains 12 fictional rows: four videos with three snapshots each. Expected all-platform 24h growth is 8,600 views; 7d growth is 13,100. The sample comparison time is 2026-10-29T04:00:00Z, not the current clock time. Remove fictional rows using a separate empty database before tracking real accounts.

CSV headers (all must be present; order can vary):

```csv
platform,account,video_id,title,category,url,published_at,captured_at,views
facebook,my-page,video-123,Event highlights,Event,https://www.facebook.com/,2026-10-01T09:00:00+08:00,2026-10-29T12:00:00+08:00,1200
```

- Export Excel as **CSV UTF-8**. Direct .xlsx import is not implemented. Platform-export columns must first be mapped to this template.
- Platform values: `facebook`, `instagram`, `tiktok`, `xiaohongshu`. Use a stable account name/ID and platform video ID, not a changing title.
- `views` is the cumulative view count, a non-negative whole number without thousands separators. Likes and impressions are not substitutes for views.
- Dates must include a timezone (Z or +08:00). Store the actual time you observed the count; do not fabricate earlier snapshots. Snapshot time must follow publication and cannot be more than five minutes in the future.
- Empty category becomes Uncategorized; URL can be empty. Quote commas, double quotes and line breaks using standard CSV quoting.
- Max 2 MB and 10,000 rows. One invalid row rejects the entire file without saving anything. Duplicate video/timestamp rows within one file are rejected.
- Re-importing the same video/timestamp updates the existing count. Import a new capture time to add history. Latest-timestamp metadata wins, so an old export does not overwrite newer labels. To change a category, edit and re-import the latest snapshot row.
- All timestamps are stored in PostgreSQL timestamptz and displayed in UTC. +08:00 represents Malaysia time.

## Growth definitions

The dashboard compares videos at the newest snapshot time among the filtered videos, displayed above the rankings. It is a historical comparison, not a live measurement. Latest-view totals sum the last observed count for each video and may mix capture times.

For each 24h/7d window, an endpoint must be within six hours before the common comparison time. The baseline is the most recent snapshot at or before the window start, at most six hours earlier. Growth is endpoint views minus baseline views. Hover on a change value for the exact interval. This observed interval may differ from precisely 24h/168h; no interpolation or extrapolation occurs.

Snapshots with different metric labels (for example CSV views and an API-specific metric) are not compared. View definitions differ across platforms; use the platform filter for like-for-like comparisons. Missing/stale history is shown as an em dash, excluded from growth totals and category averages, and reflected in coverage. A zero baseline has no percentage. Negative count corrections remain negative. Category rankings use mean absolute view change per measured video; category sample sizes and platform measurement differences should be considered. Imported category labels apply to the entire video's history, not time-varying categories.

## Integrations and limits

| Capability | Status |
| --- | --- |
| CSV imports, PostgreSQL snapshots, dashboard | Implemented |
| Facebook official API | Implemented for Page /videos + lifetime Video Insights; approved Page token required; separate Reels discovery not implemented |
| Instagram official API | Implemented for professional-account VIDEO media through Facebook Login; approved token required |
| TikTok official API | Implemented for authorized public videos; approved Display API token required |
| Xiaohongshu API | Not implemented; use CSV/manual snapshots |
| OAuth UI, token renewal, scheduled collection, n8n | Not implemented; manual access tokens stay in local .env.local |
| AI, Excel workbook parsing, 30-day analytics | Not implemented |

Official social API requests occur only when you click a sync button. No scraping is included. The new server connectors are in lib/connectors. Upstream adapter examples remain in lib/adapters for reference but are not called by the video dashboard. Legacy /report and /platform routes redirect home; old metrics/report/cron endpoints return 410. Upstream outbound report delivery and Vercel cron are disabled.

The manual sync endpoints are POST /api/connections/{platform}/sync and require a same-origin request from a local address. CSV imports have the same write restriction. Tokens are server-only environment variables. Live account compatibility and approved permissions must still be verified using your own tokens; fixture tests are not live authorization. See API_SETUP.md for supported content and limits.

This MVP loads snapshot history into the page and is intended for a personal dataset. Pagination, retention, editable forms, database export UI and large-scale analytics queries are future work.

## Verification

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

Tests also cover connector pagination, account-token mismatch, missing metrics, error redaction, source labels and category preservation. Tests cover CSV validation, timezone handling, 24h/7d growth, missing/stale data, zero baselines, negative corrections, category coverage, schema application, real SQL import/upsert, isolation and rollback. By default database tests use PGlite (the PostgreSQL engine running locally in WebAssembly). This does not test native PostgreSQL networking or advisory locks.

To test against native PostgreSQL, set `TEST_DATABASE_URL` and run `npm test`. The database test creates a uniquely named temporary schema, runs its fixtures there, and removes only that schema in cleanup; the test login needs permission to create schemas. Prefer a separate test database for routine testing.

```powershell
$env:TEST_DATABASE_URL='postgresql://video:your-password@127.0.0.1:5432/video_growth_test'
npm test
Remove-Item Env:TEST_DATABASE_URL
```

For a browser smoke test after dependencies are installed:

```powershell
npx playwright install chromium
npx playwright test
```

This starts the app with no database or API credentials configured and verifies the setup/empty state, logos, connection status, disabled sync buttons, CSV validation, and disabled legacy endpoints. A live import requires your local PostgreSQL setup; live syncs also require approved access tokens.

## Backup

For Docker, create a local SQL backup without piping binary data through PowerShell:

```powershell
docker compose exec db pg_dump -U video -d video_growth -f /tmp/video-growth.sql
docker compose cp db:/tmp/video-growth.sql ./video-growth-backup.sql
```

Keep backups private (account/video information). For native PostgreSQL, use pgAdmin backup or pg_dump. Container removal without deleting the named volume retains data; deleting the volume permanently deletes the database.
