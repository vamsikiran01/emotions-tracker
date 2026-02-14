
-- Drop all existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can view their own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can create their own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON public.journal_entries;

-- Create fully permissive public access policies
CREATE POLICY "Public read access" ON public.journal_entries FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.journal_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.journal_entries FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.journal_entries FOR DELETE USING (true);

-- Make user_id have a default so inserts work without auth
ALTER TABLE public.journal_entries ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;
