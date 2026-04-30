-- Central media catalog: every file uploaded to the `media` bucket can be tracked here
-- so admins can browse, reuse, and bulk-manage assets across the whole site.

CREATE TABLE public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  storage_path TEXT,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  mime_type TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  folder TEXT DEFAULT 'library',
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_library_type ON public.media_library(type);
CREATE INDEX idx_media_library_created_at ON public.media_library(created_at DESC);
CREATE INDEX idx_media_library_tags ON public.media_library USING GIN(tags);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Public read so the picker / front-end can browse if needed
CREATE POLICY "Media library is publicly readable"
  ON public.media_library
  FOR SELECT
  USING (true);

-- Admins and content managers can upload
CREATE POLICY "Content managers can insert media"
  ON public.media_library
  FOR INSERT
  WITH CHECK (public.is_content_manager(auth.uid()));

CREATE POLICY "Content managers can update media"
  ON public.media_library
  FOR UPDATE
  USING (public.is_content_manager(auth.uid()));

CREATE POLICY "Content managers can delete media"
  ON public.media_library
  FOR DELETE
  USING (public.is_content_manager(auth.uid()));

CREATE TRIGGER update_media_library_updated_at
  BEFORE UPDATE ON public.media_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();