
-- 1. Remove donations from realtime publication (PII exposure surface)
ALTER PUBLICATION supabase_realtime DROP TABLE public.donations;

-- 2. Restrict listing on public media bucket: keep public URL access (CDN bypasses RLS for public buckets) but disallow API listing
DROP POLICY IF EXISTS "Media is publicly accessible" ON storage.objects;
CREATE POLICY "Admins and content managers can list media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media' AND is_content_manager(auth.uid()));

-- 3. Revoke EXECUTE on internal trigger-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.clamp_site_images_overlay() FROM anon, authenticated, public;
