-- Update all industry pages to published status so they are visible
UPDATE public.content_pages 
SET status = 'published' 
WHERE page_type = 'general' 
AND slug IN ('automotive', 'retail', 'technology', 'healthcare', 'financial-services', 'entertainment', 'education', 'real-estate', 'recruitment');