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