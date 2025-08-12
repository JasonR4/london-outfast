-- Seed media format categories based on heuristics from existing media_formats
-- This migration is idempotent via NOT EXISTS checks

-- 1) London Underground (location)
WITH m AS (
  SELECT id, format_slug, format_name, COALESCE(description,'') AS desc
  FROM public.media_formats
  WHERE is_active = true
)
INSERT INTO public.media_format_categories (media_format_id, category_type, category_name, is_active, created_by, updated_by)
SELECT m.id, 'location', 'London Underground', true, NULL, NULL
FROM m
WHERE (
  m.format_slug ILIKE '%tube%'
  OR m.format_slug ILIKE '%underground%'
  OR m.format_slug ILIKE '%escalator%'
  OR m.format_slug ILIKE '%cross-track%'
  OR m.format_name ILIKE '%Underground%'
  OR m.format_name ILIKE '%Escalator%'
  OR m.format_name ILIKE '%Cross Track%'
  OR m.desc ILIKE '%Underground%'
)
AND NOT EXISTS (
  SELECT 1 FROM public.media_format_categories c
  WHERE c.media_format_id = m.id AND c.category_type = 'location' AND c.category_name = 'London Underground'
);

-- 2) Transport (location) – buses, tube/underground, rail, bikes
WITH m AS (
  SELECT id, format_slug, format_name, COALESCE(description,'') AS desc
  FROM public.media_formats
  WHERE is_active = true
)
INSERT INTO public.media_format_categories (media_format_id, category_type, category_name, is_active, created_by, updated_by)
SELECT m.id, 'location', 'Transport', true, NULL, NULL
FROM m
WHERE (
  m.format_slug ILIKE '%bus%'
  OR m.format_name ILIKE '%Bus%'
  OR m.format_slug ILIKE '%tube%'
  OR m.format_slug ILIKE '%underground%'
  OR m.format_name ILIKE '%Underground%'
  OR m.format_slug ILIKE '%rail%'
  OR m.format_name ILIKE '%Rail%'
  OR m.format_slug ILIKE '%bike%'
  OR m.format_name ILIKE '%Bike%'
)
AND NOT EXISTS (
  SELECT 1 FROM public.media_format_categories c
  WHERE c.media_format_id = m.id AND c.category_type = 'location' AND c.category_name = 'Transport'
);

-- 3) Roadside (location) – billboards, phone boxes
WITH m AS (
  SELECT id, format_slug, format_name, COALESCE(description,'') AS desc
  FROM public.media_formats
  WHERE is_active = true
)
INSERT INTO public.media_format_categories (media_format_id, category_type, category_name, is_active, created_by, updated_by)
SELECT m.id, 'location', 'Roadside', true, NULL, NULL
FROM m
WHERE (
  m.format_slug ILIKE '%billboard%'
  OR m.format_name ILIKE '%Billboard%'
  OR m.format_slug ILIKE '%phone%'
  OR m.format_name ILIKE '%Phone%'
)
AND NOT EXISTS (
  SELECT 1 FROM public.media_format_categories c
  WHERE c.media_format_id = m.id AND c.category_type = 'location' AND c.category_name = 'Roadside'
);

-- 4) Digital (format) – anything explicitly digital or known digital variants
WITH m AS (
  SELECT id, format_slug, format_name, COALESCE(description,'') AS desc
  FROM public.media_formats
  WHERE is_active = true
)
INSERT INTO public.media_format_categories (media_format_id, category_type, category_name, is_active, created_by, updated_by)
SELECT m.id, 'format', 'Digital', true, NULL, NULL
FROM m
WHERE (
  m.format_slug ILIKE '%digital%'
  OR m.format_name ILIKE 'Digital %'
  OR m.desc ILIKE '%digital%'
  OR m.format_slug ILIKE '%adshel-live%'
  OR m.format_slug ILIKE '%cross-track%'
  OR m.format_slug ILIKE '%digital-escalator%'
)
AND NOT EXISTS (
  SELECT 1 FROM public.media_format_categories c
  WHERE c.media_format_id = m.id AND c.category_type = 'format' AND c.category_name = 'Digital'
);

-- 5) Paper & Paste (format) – non-digital sheets/posters
WITH m AS (
  SELECT id, format_slug, format_name, COALESCE(description,'') AS desc
  FROM public.media_formats
  WHERE is_active = true
)
INSERT INTO public.media_format_categories (media_format_id, category_type, category_name, is_active, created_by, updated_by)
SELECT m.id, 'format', 'Paper & Paste', true, NULL, NULL
FROM m
WHERE (
  (m.format_slug ILIKE '%sheet%' OR m.format_name ILIKE '%Sheet%')
  AND NOT (
    m.format_slug ILIKE '%digital%'
    OR m.format_name ILIKE 'Digital %'
    OR m.desc ILIKE '%digital%'
    OR m.format_slug ILIKE '%adshel-live%'
    OR m.format_slug ILIKE '%cross-track%'
    OR m.format_slug ILIKE '%digital-escalator%'
  )
)
AND NOT EXISTS (
  SELECT 1 FROM public.media_format_categories c
  WHERE c.media_format_id = m.id AND c.category_type = 'format' AND c.category_name = 'Paper & Paste'
);
