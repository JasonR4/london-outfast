-- Update homepage SEO title with proper user ID
UPDATE seo_pages 
SET 
  meta_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  og_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  twitter_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  updated_at = NOW(),
  updated_by = '550e8400-e29b-41d4-a716-446655440000'
WHERE page_slug = '/';