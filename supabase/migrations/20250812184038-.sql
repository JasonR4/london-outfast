-- Add additional environment (location) categories for existing formats
-- Idempotent inserts guarded by NOT EXISTS

-- Rail (location)
WITH m AS (
  SELECT id, format_slug, format_name, COALESCE(description,'') AS desc
  FROM public.media_formats
  WHERE is_active = true
)
INSERT INTO public.media_format_categories (media_format_id, category_type, category_name, is_active, created_by, updated_by)
SELECT m.id, 'location', 'Rail', true, NULL, NULL
FROM m
WHERE (
  m.format_slug ILIKE '%rail%'
  OR m.format_name ILIKE '%Rail%'
  OR m.desc ILIKE '%rail%'
)
AND NOT EXISTS (
  SELECT 1 FROM public.media_format_categories c
  WHERE c.media_format_id = m.id AND c.category_type = 'location' AND c.category_name = 'Rail'
);

-- Retail (location)
WITH m AS (
  SELECT id, format_slug, format_name, COALESCE(description,'') AS desc
  FROM public.media_formats
  WHERE is_active = true
)
INSERT INTO public.media_format_categories (media_format_id, category_type, category_name, is_active, created_by, updated_by)
SELECT m.id, 'location', 'Retail', true, NULL, NULL
FROM m
WHERE (
  m.format_slug ILIKE '%retail%'
  OR m.format_name ILIKE '%Retail%'
  OR m.desc ILIKE '%retail%'
  OR m.desc ILIKE '%shopping%'
  OR m.desc ILIKE '%mall%'
)
AND NOT EXISTS (
  SELECT 1 FROM public.media_format_categories c
  WHERE c.media_format_id = m.id AND c.category_type = 'location' AND c.category_name = 'Retail'
);

-- Supermarket (location)
WITH m AS (
  SELECT id, format_slug, format_name, COALESCE(description,'') AS desc
  FROM public.media_formats
  WHERE is_active = true
)
INSERT INTO public.media_format_categories (media_format_id, category_type, category_name, is_active, created_by, updated_by)
SELECT m.id, 'location', 'Supermarket', true, NULL, NULL
FROM m
WHERE (
  m.format_slug ILIKE '%supermarket%'
  OR m.format_name ILIKE '%Supermarket%'
  OR m.desc ILIKE '%supermarket%'
)
AND NOT EXISTS (
  SELECT 1 FROM public.media_format_categories c
  WHERE c.media_format_id = m.id AND c.category_type = 'location' AND c.category_name = 'Supermarket'
);
