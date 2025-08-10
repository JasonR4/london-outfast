-- Public read access for CMS content while keeping write operations restricted to authenticated/admin users.
-- This migration enables/ensures RLS and adds SELECT policies for anon on public-facing content tables.

-- 1) Helper function to check if a blog post is published
CREATE OR REPLACE FUNCTION public.is_blog_post_published(p_post_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE((SELECT status = 'published' FROM public.blog_posts WHERE id = p_post_id), false);
$$;

-- 2) Ensure RLS is enabled
ALTER TABLE IF EXISTS public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_format_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seo_pages ENABLE ROW LEVEL SECURITY;

-- 3) Public (anon) read-only policies for published/active content
-- Use unique policy names and avoid dropping existing ones to prevent disruption

-- Global settings (only active)
DO $$ BEGIN
  CREATE POLICY "Public read active global settings"
  ON public.global_settings
  FOR SELECT
  TO anon
  USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Homepage content (only active)
DO $$ BEGIN
  CREATE POLICY "Public read active homepage content"
  ON public.homepage_content
  FOR SELECT
  TO anon
  USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Content pages (only published)
DO $$ BEGIN
  CREATE POLICY "Public read published content pages"
  ON public.content_pages
  FOR SELECT
  TO anon
  USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Blog posts (only published)
DO $$ BEGIN
  CREATE POLICY "Public read published blog posts"
  ON public.blog_posts
  FOR SELECT
  TO anon
  USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Blog categories (active only)
DO $$ BEGIN
  CREATE POLICY "Public read active blog categories"
  ON public.blog_categories
  FOR SELECT
  TO anon
  USING (COALESCE(is_active, true));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Blog post category join table (only for published posts)
DO $$ BEGIN
  CREATE POLICY "Public read blog_post_categories for published posts"
  ON public.blog_post_categories
  FOR SELECT
  TO anon
  USING (public.is_blog_post_published(post_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Media formats and categories (active only)
DO $$ BEGIN
  CREATE POLICY "Public read active media formats"
  ON public.media_formats
  FOR SELECT
  TO anon
  USING (COALESCE(is_active, true));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read active media format categories"
  ON public.media_format_categories
  FOR SELECT
  TO anon
  USING (COALESCE(is_active, true));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Analytics codes (active only)
DO $$ BEGIN
  CREATE POLICY "Public read active analytics codes"
  ON public.analytics_codes
  FOR SELECT
  TO anon
  USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- SEO pages (generally safe to be fully public)
DO $$ BEGIN
  CREATE POLICY "Public read seo pages"
  ON public.seo_pages
  FOR SELECT
  TO anon
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Realtime replication for live updates in UI (idempotent)
DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.global_settings';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.homepage_content';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.content_pages';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_categories';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_post_categories';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.media_formats';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.media_format_categories';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_codes';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.seo_pages';
EXCEPTION WHEN duplicate_object THEN NULL WHEN undefined_table THEN NULL; END $$;
