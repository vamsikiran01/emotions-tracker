
-- Drop old public policies
DROP POLICY IF EXISTS "Public read access" ON journal_entries;
DROP POLICY IF EXISTS "Public insert access" ON journal_entries;
DROP POLICY IF EXISTS "Public update access" ON journal_entries;
DROP POLICY IF EXISTS "Public delete access" ON journal_entries;

-- Set user_id default to authenticated user
ALTER TABLE journal_entries
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- New per-user policies
CREATE POLICY "Users read own entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);
