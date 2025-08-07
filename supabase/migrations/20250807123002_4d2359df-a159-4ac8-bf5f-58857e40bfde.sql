-- Update the existing CMS content for 16-sheet-corridor-panels to use the correct title
UPDATE content_pages 
SET 
  title = '16 Sheet London Underground',
  content = jsonb_set(
    content, 
    '{hero_title}', 
    '"16 Sheet London Underground"'
  )
WHERE slug = '16-sheet-corridor-panels';