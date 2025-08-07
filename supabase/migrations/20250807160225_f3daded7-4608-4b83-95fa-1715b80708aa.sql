-- Update homepage SEO title with actual user ID
UPDATE seo_pages 
SET 
  meta_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  og_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  twitter_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  updated_at = NOW(),
  updated_by = '920f996a-5909-4313-9b00-6511c9cabff4'
WHERE page_slug = '/';