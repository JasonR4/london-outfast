-- Update all existing CMS content pages for media formats to sync with database format names
UPDATE content_pages 
SET 
  title = mf.format_name,
  content = jsonb_set(
    content, 
    '{hero_title}', 
    to_jsonb(mf.format_name)
  ),
  updated_at = now(),
  updated_by = COALESCE(auth.uid(), content_pages.created_by)
FROM media_formats mf
WHERE content_pages.slug = mf.format_slug 
AND content_pages.page_type = 'ooh_format'
AND mf.is_active = true;