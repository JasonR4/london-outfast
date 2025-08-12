begin;
-- 0) Backfill updated_by to avoid NOT NULL violations
UPDATE public.seo_pages
SET updated_by = COALESCE(updated_by, created_by)
WHERE updated_by IS NULL;

-- 1) Replace any .com domains with .co.uk in canonical_url
UPDATE public.seo_pages
SET canonical_url = regexp_replace(canonical_url, '^https?://(www\.)?mediabuyinglondon\.com', 'https://mediabuyinglondon.co.uk'),
    updated_by = COALESCE(updated_by, created_by),
    updated_at = now()
WHERE canonical_url ILIKE '%mediabuyinglondon.com%';

-- 2) Ensure homepage canonical is exactly the root with trailing slash
UPDATE public.seo_pages
SET canonical_url = 'https://mediabuyinglondon.co.uk/',
    updated_by = COALESCE(updated_by, created_by),
    updated_at = now()
WHERE page_slug = '/' AND (canonical_url IS NULL OR canonical_url NOT LIKE 'https://mediabuyinglondon.co.uk/%');

-- 3) Cleanup any accidental double slashes after the domain
UPDATE public.seo_pages
SET canonical_url = regexp_replace(canonical_url, 'https://mediabuyinglondon\.co\.uk//+', 'https://mediabuyinglondon.co.uk/', 'g'),
    updated_by = COALESCE(updated_by, created_by),
    updated_at = now()
WHERE canonical_url LIKE 'https://mediabuyinglondon.co.uk//%';
commit;