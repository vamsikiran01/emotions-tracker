
-- Drop the restrictive policies
DROP POLICY "Users can view their own entries" ON public.journal_entries;
DROP POLICY "Users can create their own entries" ON public.journal_entries;
DROP POLICY "Users can update their own entries" ON public.journal_entries;
DROP POLICY "Users can delete their own entries" ON public.journal_entries;

-- Recreate as PERMISSIVE policies (the default)
CREATE POLICY "Users can view their own entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);
