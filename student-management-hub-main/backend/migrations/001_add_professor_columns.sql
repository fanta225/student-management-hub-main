-- migration: add extra fields to professors table

ALTER TABLE professors
  ADD COLUMN email TEXT,
  ADD COLUMN department TEXT,
  ADD COLUMN status TEXT DEFAULT 'active',
  ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

-- optionally initialize existing rows with defaults
UPDATE professors SET status='active' WHERE status IS NULL;

-- you may also want to create an index on username if not already present
CREATE UNIQUE INDEX IF NOT EXISTS idx_professors_username ON professors(username);
