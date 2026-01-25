-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery_media table
CREATE TABLE public.gallery_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin or content_manager
CREATE OR REPLACE FUNCTION public.is_content_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'content_manager')
  )
$$;

-- Blog posts policies
CREATE POLICY "Published blog posts are publicly readable"
  ON public.blog_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins and content managers can view all posts"
  ON public.blog_posts FOR SELECT
  USING (is_content_manager(auth.uid()));

CREATE POLICY "Admins and content managers can create posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (is_content_manager(auth.uid()));

CREATE POLICY "Admins and content managers can update posts"
  ON public.blog_posts FOR UPDATE
  USING (is_content_manager(auth.uid()));

CREATE POLICY "Admins and content managers can delete posts"
  ON public.blog_posts FOR DELETE
  USING (is_content_manager(auth.uid()));

-- Gallery media policies
CREATE POLICY "Active gallery media is publicly readable"
  ON public.gallery_media FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins and content managers can view all media"
  ON public.gallery_media FOR SELECT
  USING (is_content_manager(auth.uid()));

CREATE POLICY "Admins and content managers can manage media"
  ON public.gallery_media FOR ALL
  USING (is_content_manager(auth.uid()));

-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media bucket
CREATE POLICY "Media is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Admins and content managers can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND is_content_manager(auth.uid()));

CREATE POLICY "Admins and content managers can update media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND is_content_manager(auth.uid()));

CREATE POLICY "Admins and content managers can delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND is_content_manager(auth.uid()));

-- Add trigger for updated_at on blog_posts
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();