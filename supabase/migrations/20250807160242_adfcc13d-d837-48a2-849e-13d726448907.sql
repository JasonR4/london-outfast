-- Temporarily disable the trigger, update the title, then re-enable
ALTER TABLE seo_pages DISABLE TRIGGER update_seo_pages_updated_at;

UPDATE seo_pages 
SET 
  meta_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  og_title = 'Media Buying London - Fastest OOH Media Buying Specialist',
  twitter_title = 'Media Buying London - Fastest OOH Media Buying Specialist'
WHERE page_slug = '/';

ALTER TABLE seo_pages ENABLE TRIGGER update_seo_pages_updated_at;