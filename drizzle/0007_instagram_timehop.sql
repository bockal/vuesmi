CREATE TABLE IF NOT EXISTS instagram_hashtag_media (
  id TEXT PRIMARY KEY,
  caption TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  permalink TEXT NOT NULL,
  posted_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS instagram_hashtag_media_posted_at_idx
  ON instagram_hashtag_media(posted_at DESC);
