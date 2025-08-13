-- Add "media buying london" and "media planning london" to target keywords
UPDATE public.seo_pages 
SET keywords = keywords || ARRAY['media buying london', 'media planning london'],
    updated_at = now()
WHERE page_slug = '/';