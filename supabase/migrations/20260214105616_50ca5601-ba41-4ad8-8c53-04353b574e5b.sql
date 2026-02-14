
-- Make journal-audio bucket private
UPDATE storage.buckets SET public = false WHERE id = 'journal-audio';

-- Drop old public storage policies
DROP POLICY IF EXISTS "Public read access for journal audio" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for journal audio" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for journal audio" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for journal audio" ON storage.objects;

-- User-scoped storage policies using user_id folder prefix
CREATE POLICY "Users read own audio" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'journal-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users upload own audio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'journal-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own audio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'journal-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
