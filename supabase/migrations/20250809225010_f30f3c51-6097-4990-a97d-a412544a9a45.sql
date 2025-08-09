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