Verified on Windows on October 30, 2026.

- 19 automated data/connector tests pass: CSV validation, growth calculations, metric compatibility, SQL schema/import/upsert/rollback, API source labels and category preservation, connector pagination, account identity checks, error handling and secret redaction.
- TypeScript type checking and ESLint pass.
- Next.js production build passes. Both Chromium browser smoke tests pass after the API and logo changes.
- Browser tests cover desktop/mobile layout, local app/platform logos, CSV validation, connection status, disabled unconfigured sync buttons, missing configuration errors, unsupported platforms, disabled legacy endpoints and foreign-origin rejection.
- Database schema migration is version 2 and repeatable.

The full 19-test suite passed both with local PGlite and with the configured native PostgreSQL database. Native tests ran in an isolated temporary schema that was removed afterward, and exercised real advisory locks and transactions. The app database was upgraded successfully to schema version 2 without deleting existing records. Docker networking/volume behavior remains unverified. Connector tests use simulated official API responses, not live accounts. No social credentials have been configured by this change and no live sync has been verified. Meta documentation was rate-limited/inaccessible from this environment; API_SETUP.md records supported endpoint assumptions, permission checks and content coverage. Xiaohongshu analytics, OAuth UI, automatic token renewal, scheduled collection and separate Facebook Reels discovery remain unimplemented.
