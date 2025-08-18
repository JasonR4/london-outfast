-- Check current policies for blog_posts
\dp blog_posts;

-- Fix RLS policy to allow public viewing of published posts
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;

CREATE POLICY "Public can view published blog posts" 
ON blog_posts 
FOR SELECT 
USING (status = 'published');

-- Also ensure authenticated users can still see all posts
DROP POLICY IF EXISTS "Authenticated users can view all blog posts" ON blog_posts;

CREATE POLICY "Authenticated users can view all blog posts" 
ON blog_posts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);