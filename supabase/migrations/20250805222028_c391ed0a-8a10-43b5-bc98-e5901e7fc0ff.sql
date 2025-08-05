-- Update About page hero title to "We're specialist media planners and buyers."
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{hero_title}',
  '"We''re specialist media planners and buyers."'::jsonb
)
WHERE slug = 'about' AND status = 'published';