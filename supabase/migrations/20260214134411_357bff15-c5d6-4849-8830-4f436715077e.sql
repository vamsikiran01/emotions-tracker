-- Drop existing policies and recreate them scoped to 'authenticated' role only

-- journal_entries
DROP POLICY IF EXISTS "Users read own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users insert own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users update own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users delete own entries" ON public.journal_entries;

CREATE POLICY "Users read own entries" ON public.journal_entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own entries" ON public.journal_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own entries" ON public.journal_entries
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users delete own entries" ON public.journal_entries
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Admins can read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can read roles" ON public.user_roles
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));