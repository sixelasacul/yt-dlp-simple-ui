CREATE TABLE IF NOT EXISTS jobs(
  -- uuid
  id TEXT PRIMARY KEY,
  -- for tracking if needed
  user_input TEXT,
  -- yt-dlp process
  pid INTEGER,
  -- 0 to 100
  progress INTEGER,
  logs TEXT,
  -- in_progress, finished, failed, stop
  status TEXT
);
