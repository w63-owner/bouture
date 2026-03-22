-- Storage bucket creation + RLS policies
-- Ensures buckets exist and authenticated users can upload to their own folder
-- Idempotent: drops existing policies before recreating them

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('plant-library', 'plant-library', true),
  ('listings', 'listings', true),
  ('avatars', 'avatars', true),
  ('chat-images', 'chat-images', false)
ON CONFLICT (id) DO NOTHING;

-- plant-library policies
DROP POLICY IF EXISTS "Users can upload plant photos" ON storage.objects;
CREATE POLICY "Users can upload plant photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'plant-library'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own plant photos" ON storage.objects;
CREATE POLICY "Users can update own plant photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'plant-library'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own plant photos" ON storage.objects;
CREATE POLICY "Users can delete own plant photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'plant-library'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Public can view plant photos" ON storage.objects;
CREATE POLICY "Public can view plant photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plant-library');

-- listings policies
DROP POLICY IF EXISTS "Users can upload listing photos" ON storage.objects;
CREATE POLICY "Users can upload listing photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own listing photos" ON storage.objects;
CREATE POLICY "Users can delete own listing photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Public can view listing photos" ON storage.objects;
CREATE POLICY "Public can view listing photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');

-- avatars policies
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- chat-images policies
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated users can view chat images" ON storage.objects;
CREATE POLICY "Authenticated users can view chat images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-images'
    AND auth.role() = 'authenticated'
  );
