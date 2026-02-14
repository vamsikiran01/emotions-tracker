

# Privacy and Unlimited Storage for Emo Track

## The Problems
1. **No privacy**: All users see everyone's journal entries because the database policies allow public access and entries use a shared dummy user ID.
2. **Entry limit**: The database query has a default 1,000-row cap, and there's no pagination for large datasets.

## What Will Change

### 1. Require Login on All Pages
- Wrap the journal page (`/`), results page (`/results`), and dashboard (`/dashboard`) with the existing `ProtectedRoute` component in `App.tsx`
- Users who aren't signed in will be redirected to the `/login` page (Google sign-in already works)

### 2. Lock Down the Database (RLS Policies)
- **Remove** all 4 existing public RLS policies (SELECT, INSERT, UPDATE, DELETE with `true`)
- **Create** new policies that restrict every operation to only the authenticated user's own rows:
  - SELECT: `auth.uid() = user_id`
  - INSERT: `auth.uid() = user_id`
  - UPDATE: `auth.uid() = user_id`
  - DELETE: `auth.uid() = user_id`
- Also make the `user_id` column default to `auth.uid()` instead of the dummy UUID, so it's automatically set on insert

### 3. Save Entries with the Real User ID
- Update `saveEntry` in `src/lib/storage.ts` to include `user_id` from the current session (`supabase.auth.getUser()`)
- No need to filter by `user_id` in queries -- RLS handles it automatically

### 4. Fetch All Entries (No Limit)
- Update `getEntries` to use paginated fetching: loop with `.range(offset, offset + 999)` until all rows are retrieved
- This removes the 1,000-row default cap and supports unlimited entries

### 5. Update "Clear All" Logic
- The current `clearEntries` uses `.neq('id', '00000000-...')` which is a workaround. With RLS in place, a simple `.neq('id', '')` or `.gte('created_at', '1970-01-01')` will delete only the current user's rows automatically

---

## Technical Details

### Database Migration (SQL)
```text
-- Drop old public policies
DROP POLICY "Public read access" ON journal_entries;
DROP POLICY "Public insert access" ON journal_entries;
DROP POLICY "Public update access" ON journal_entries;
DROP POLICY "Public delete access" ON journal_entries;

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
```

### Files to Modify

1. **`src/App.tsx`** -- Wrap `/`, `/results`, `/dashboard` routes with `ProtectedRoute`
2. **`src/lib/storage.ts`**:
   - `saveEntry`: fetch `auth.uid()` and set `user_id`
   - `getEntries`: paginated loop to fetch all rows
   - `clearEntries`: simplify the delete filter
3. **Database migration** -- Replace RLS policies and update `user_id` default

### Impact on Existing Data
- Old entries with the dummy `user_id` (`00000000-...`) will no longer be visible to anyone since they don't match any real user. This is the correct privacy behavior -- those shared entries should not be accessible.

