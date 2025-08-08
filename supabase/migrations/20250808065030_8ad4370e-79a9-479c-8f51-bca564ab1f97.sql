-- Blog feature schema
-- 1) Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_html TEXT, -- optional HTML body for quick rendering
  content JSONB NOT NULL DEFAULT '{}'::jsonb, -- structured content if needed
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  cover_image_url TEXT,
  author_id UUID NOT NULL,
  reading_time INTEGER,
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- 2) Blog categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- 3) Join: post -> categories
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  UNIQUE(post_id, category_id)
);

-- 4) Join: post -> media formats
CREATE TABLE IF NOT EXISTS public.blog_post_media_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  media_format_id UUID NOT NULL REFERENCES public.media_formats(id) ON DELETE CASCADE,
  UNIQUE(post_id, media_format_id)
);

-- 5) Join: post -> media format categories (sizes/types)
CREATE TABLE IF NOT EXISTS public.blog_post_media_format_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  media_format_category_id UUID NOT NULL REFERENCES public.media_format_categories(id) ON DELETE CASCADE,
  UNIQUE(post_id, media_format_category_id)
);

-- 6) Media assets attached to posts
CREATE TABLE IF NOT EXISTS public.blog_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image' | 'video' | 'other'
  alt_text TEXT,
  caption TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS enable
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_media_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_media_format_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_media_assets ENABLE ROW LEVEL SECURITY;

-- Policies
-- blog_posts policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can view all blog posts" ON public.blog_posts
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert blog posts" ON public.blog_posts
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update blog posts" ON public.blog_posts
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts
FOR DELETE USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin','admin')
));

-- blog_categories
CREATE POLICY "Anyone can view active blog categories" ON public.blog_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can view all blog categories" ON public.blog_categories
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert blog categories" ON public.blog_categories
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update blog categories" ON public.blog_categories
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete blog categories" ON public.blog_categories
FOR DELETE USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin','admin')
));

-- Simple permissive policies for join tables and media assets
CREATE POLICY "Public can view blog joins" ON public.blog_post_categories FOR SELECT USING (true);
CREATE POLICY "Public can view blog format joins" ON public.blog_post_media_formats FOR SELECT USING (true);
CREATE POLICY "Public can view blog format category joins" ON public.blog_post_media_format_categories FOR SELECT USING (true);
CREATE POLICY "Public can view blog media assets" ON public.blog_media_assets FOR SELECT USING (true);

CREATE POLICY "Authenticated can modify blog joins" ON public.blog_post_categories FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can modify blog format joins" ON public.blog_post_media_formats FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can modify blog format category joins" ON public.blog_post_media_format_categories FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can modify blog media assets" ON public.blog_media_assets FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger to maintain updated_at and updated_by
CREATE OR REPLACE FUNCTION public.update_updated_at_and_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_blog_posts_updated ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_and_by();

DROP TRIGGER IF EXISTS trg_blog_categories_updated ON public.blog_categories;
CREATE TRIGGER trg_blog_categories_updated
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_and_by();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
