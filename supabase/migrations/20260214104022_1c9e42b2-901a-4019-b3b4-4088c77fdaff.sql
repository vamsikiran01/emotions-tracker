
-- Add audio_url column to journal_entries
ALTER TABLE public.journal_entries ADD COLUMN audio_url text;

-- Create storage bucket for journal audio
INSERT INTO storage.buckets (id, name, public) VALUES ('journal-audio', 'journal-audio', true);

-- Storage policies for public access
CREATE POLICY "Public read access for journal audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'journal-audio');

CREATE POLICY "Public insert access for journal audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'journal-audio');

CREATE POLICY "Public update access for journal audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'journal-audio');

CREATE POLICY "Public delete access for journal audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'journal-audio');
