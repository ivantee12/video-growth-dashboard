CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY);
CREATE TABLE IF NOT EXISTS videos (
  id bigserial PRIMARY KEY,
  platform text NOT NULL CHECK (platform IN ('facebook','instagram','tiktok','xiaohongshu')),
  account text NOT NULL,
  external_id text NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Uncategorized',
  url text NOT NULL DEFAULT '',
  published_at timestamptz NOT NULL,
  metadata_at timestamptz NOT NULL,
  UNIQUE (platform, account, external_id)
);
CREATE TABLE IF NOT EXISTS snapshots (
  video_id bigint NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  captured_at timestamptz NOT NULL,
  views bigint NOT NULL CHECK (views >= 0 AND views <= 9007199254740991),
  source text NOT NULL DEFAULT 'csv',
  PRIMARY KEY (video_id, captured_at)
);
CREATE INDEX IF NOT EXISTS snapshots_time_idx ON snapshots(captured_at);
INSERT INTO schema_migrations(version) VALUES (1) ON CONFLICT DO NOTHING;
ALTER TABLE snapshots ADD COLUMN IF NOT EXISTS metric text NOT NULL DEFAULT 'views';
INSERT INTO schema_migrations(version) VALUES (2) ON CONFLICT DO NOTHING;
