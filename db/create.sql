CREATE TABLE IF NOT EXISTS jobs(
  -- uuid
  id TEXT PRIMARY KEY,
  -- started, running, finished, failed, stopped
  status TEXT DEFAULT "started",
  -- yt-dlp process
  pid INTEGER,
  -- 0 to 100
  progress INTEGER DEFAULT 0,
  -- for tracking if needed
  user_input TEXT DEFAULT "",
  logs TEXT DEFAULT "",
  started_at INTEGER DEFAULT unixepoch
);
