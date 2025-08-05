-- Remove emojis from industry icons in the about page content
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{sections}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN section->>'type' = 'industries_accordion' THEN
          jsonb_set(
            section,
            '{industries}',
            (
              SELECT jsonb_agg(
                jsonb_set(industry, '{icon}', '""'::jsonb)
              )
              FROM jsonb_array_elements(section->'industries') AS industry
            )
          )
        ELSE section
      END
    )
    FROM jsonb_array_elements(content->'sections') AS section
  )
)
WHERE slug = 'about' AND status = 'published';