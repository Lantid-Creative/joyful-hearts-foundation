-- Site images table for managing hero slides and page hero images
CREATE TABLE public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text NOT NULL UNIQUE,
  url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  alt_text text,
  title text,
  subtitle text,
  highlight text,
  description text,
  tagline text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site images are publicly readable"
  ON public.site_images FOR SELECT
  USING (true);

CREATE POLICY "Content managers can manage site images"
  ON public.site_images FOR ALL
  USING (public.is_content_manager(auth.uid()))
  WITH CHECK (public.is_content_manager(auth.uid()));

CREATE TRIGGER site_images_set_updated_at
  BEFORE UPDATE ON public.site_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bump media bucket file size limit to 1 GB to allow large video uploads
UPDATE storage.buckets
SET file_size_limit = 1073741824
WHERE id = 'media';