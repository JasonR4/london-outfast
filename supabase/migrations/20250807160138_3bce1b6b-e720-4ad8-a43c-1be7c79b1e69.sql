-- Update homepage SEO title
UPDATE seo_pages 
SET 
  meta_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  og_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  twitter_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  updated_at = NOW()
WHERE page_slug = '/';