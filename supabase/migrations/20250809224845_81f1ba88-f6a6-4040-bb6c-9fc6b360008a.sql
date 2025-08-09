-- Create a function to check if user email is from allowed domain
CREATE OR REPLACE FUNCTION public.is_allowed_cms_domain(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if the user's email is from r4advertising.agency domain
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = is_allowed_cms_domain.user_id 
    AND email LIKE '%@r4advertising.agency'
  );
END;
$function$

-- Update profiles policies to require r4advertising.agency domain for CMS access
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update global settings policies
DROP POLICY IF EXISTS "Authenticated users can create global settings" ON public.global_settings;
CREATE POLICY "Authenticated users can create global settings" 
ON public.global_settings 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update global settings" ON public.global_settings;
CREATE POLICY "Authenticated users can update global settings" 
ON public.global_settings 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update homepage content policies
DROP POLICY IF EXISTS "Authenticated users can create homepage content" ON public.homepage_content;
CREATE POLICY "Authenticated users can create homepage content" 
ON public.homepage_content 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update homepage content" ON public.homepage_content;
CREATE POLICY "Authenticated users can update homepage content" 
ON public.homepage_content 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update blog posts policies
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON public.blog_posts;
CREATE POLICY "Authenticated users can insert blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON public.blog_posts;
CREATE POLICY "Authenticated users can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update blog categories policies
DROP POLICY IF EXISTS "Authenticated users can insert blog categories" ON public.blog_categories;
CREATE POLICY "Authenticated users can insert blog categories" 
ON public.blog_categories 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update blog categories" ON public.blog_categories;
CREATE POLICY "Authenticated users can update blog categories" 
ON public.blog_categories 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update content pages policies
DROP POLICY IF EXISTS "Authenticated users can create content" ON public.content_pages;
CREATE POLICY "Authenticated users can create content" 
ON public.content_pages 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update content" ON public.content_pages;
CREATE POLICY "Authenticated users can update content" 
ON public.content_pages 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update media formats policies
DROP POLICY IF EXISTS "Authenticated users can create media formats" ON public.media_formats;
CREATE POLICY "Authenticated users can create media formats" 
ON public.media_formats 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update media formats" ON public.media_formats;
CREATE POLICY "Authenticated users can update media formats" 
ON public.media_formats 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update rate cards policies
DROP POLICY IF EXISTS "Authenticated users can create rate cards" ON public.rate_cards;
CREATE POLICY "Authenticated users can create rate cards" 
ON public.rate_cards 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update rate cards" ON public.rate_cards;
CREATE POLICY "Authenticated users can update rate cards" 
ON public.rate_cards 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update SEO pages policies
DROP POLICY IF EXISTS "Authenticated users can create SEO pages" ON public.seo_pages;
CREATE POLICY "Authenticated users can create SEO pages" 
ON public.seo_pages 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update SEO pages" ON public.seo_pages;
CREATE POLICY "Authenticated users can update SEO pages" 
ON public.seo_pages 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update analytics codes policies
DROP POLICY IF EXISTS "Authenticated users can create analytics codes" ON public.analytics_codes;
CREATE POLICY "Authenticated users can create analytics codes" 
ON public.analytics_codes 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update analytics codes" ON public.analytics_codes;
CREATE POLICY "Authenticated users can update analytics codes" 
ON public.analytics_codes 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update media library policies
DROP POLICY IF EXISTS "Authenticated users can upload media" ON public.media_library;
CREATE POLICY "Authenticated users can upload media" 
ON public.media_library 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update media format categories policies
DROP POLICY IF EXISTS "Authenticated users can create media format categories" ON public.media_format_categories;
CREATE POLICY "Authenticated users can create media format categories" 
ON public.media_format_categories 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update media format categories" ON public.media_format_categories;
CREATE POLICY "Authenticated users can update media format categories" 
ON public.media_format_categories 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update production cost tiers policies
DROP POLICY IF EXISTS "Authenticated users can create production cost tiers" ON public.production_cost_tiers;
CREATE POLICY "Authenticated users can create production cost tiers" 
ON public.production_cost_tiers 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update production cost tiers" ON public.production_cost_tiers;
CREATE POLICY "Authenticated users can update production cost tiers" 
ON public.production_cost_tiers 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update creative design cost tiers policies
DROP POLICY IF EXISTS "Authenticated users can create creative design cost tiers" ON public.creative_design_cost_tiers;
CREATE POLICY "Authenticated users can create creative design cost tiers" 
ON public.creative_design_cost_tiers 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update creative design cost tiers" ON public.creative_design_cost_tiers;
CREATE POLICY "Authenticated users can update creative design cost tiers" 
ON public.creative_design_cost_tiers 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update discount tiers policies
DROP POLICY IF EXISTS "Authenticated users can create discount tiers" ON public.discount_tiers;
CREATE POLICY "Authenticated users can create discount tiers" 
ON public.discount_tiers 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update discount tiers" ON public.discount_tiers;
CREATE POLICY "Authenticated users can update discount tiers" 
ON public.discount_tiers 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

-- Update quantity discount tiers policies
DROP POLICY IF EXISTS "Authenticated users can create quantity discount tiers" ON public.quantity_discount_tiers;
CREATE POLICY "Authenticated users can create quantity discount tiers" 
ON public.quantity_discount_tiers 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update quantity discount tiers" ON public.quantity_discount_tiers;
CREATE POLICY "Authenticated users can update quantity discount tiers" 
ON public.quantity_discount_tiers 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_allowed_cms_domain(auth.uid())
);