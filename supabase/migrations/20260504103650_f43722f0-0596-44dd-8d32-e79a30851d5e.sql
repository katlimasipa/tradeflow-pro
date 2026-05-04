
ALTER FUNCTION public.set_updated_at() SET search_path = public;

DROP POLICY "Public read screenshots" ON storage.objects;
CREATE POLICY "Users read own screenshots" ON storage.objects FOR SELECT
  USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
