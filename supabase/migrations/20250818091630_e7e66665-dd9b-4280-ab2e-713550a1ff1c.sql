-- Remove domain-based restrictions and use only role-based access for CMS

-- Update global_settings policies to use role-based access
DROP POLICY IF EXISTS "Authenticated users can create global settings" ON public.global_settings;
DROP POLICY IF EXISTS "Authenticated users can update global settings" ON public.global_settings;

CREATE POLICY "Admins can create global settings" 
ON public.global_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'editor')
  )
);

CREATE POLICY "Admins can update global settings" 
ON public.global_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'editor')
  )
);

-- Update content_pages policies
DROP POLICY IF EXISTS "Authenticated users can create content" ON public.content_pages;
DROP POLICY IF EXISTS "Authenticated users can update content" ON public.content_pages;

CREATE POLICY "Editors can create content" 
ON public.content_pages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'editor')
  )
);

CREATE POLICY "Editors can update content" 
ON public.content_pages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'editor')
  )
);

-- Update blog_posts policies
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON public.blog_posts;

CREATE POLICY "Editors can create blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'editor')
  )
);

CREATE POLICY "Editors can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'editor')
  )
);

-- Update media_formats policies  
DROP POLICY IF EXISTS "Authenticated users can create media formats" ON public.media_formats;
DROP POLICY IF EXISTS "Authenticated users can update media formats" ON public.media_formats;

CREATE POLICY "Editors can create media formats" 
ON public.media_formats 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'editor')
  )
);

CREATE POLICY "Editors can update media formats" 
ON public.media_formats 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'editor')
  )
);

-- Update profiles policies to remove domain restrictions
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create a simpler function to check user roles
CREATE OR REPLACE FUNCTION public.user_has_cms_role(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.user_id = user_has_cms_role.user_id 
    AND role IN ('super_admin', 'admin', 'editor')
  );
END;
$function$;