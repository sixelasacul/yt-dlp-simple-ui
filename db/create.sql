CREATE TABLE IF NOT EXISTS jobs(
  -- uuid
  id TEXT PRIMARY KEY,
  -- in_progress, finished, failed, stop
  status TEXT,
  -- yt-dlp process
  pid INTEGER,
  -- 0 to 100
  progress INTEGER,
  -- for tracking if needed
  user_input TEXT,
  logs TEXT,
  started_at INTEGER DEFAULT unixepoch()
);
