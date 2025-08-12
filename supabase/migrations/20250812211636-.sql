-- Normalize canonical URLs to .co.uk in seo_pages
-- 1) Replace any .com domains with .co.uk (handles http/https and optional www)
UPDATE public.seo_pages
SET canonical_url = regexp_replace(canonical_url, '^https?://(www\.)?mediabuyinglondon\.com', 'https://mediabuyinglondon.co.uk')
WHERE canonical_url ILIKE '%mediabuyinglondon.com%';

-- 2) Ensure homepage canonical is exactly the root with trailing slash
UPDATE public.seo_pages
SET canonical_url = 'https://mediabuyinglondon.co.uk/'
WHERE page_slug = '/' AND (canonical_url IS NULL OR canonical_url NOT LIKE 'https://mediabuyinglondon.co.uk/%');

-- 3) Optional cleanup: remove accidental double slashes after domain (not protocol) if any
UPDATE public.seo_pages
SET canonical_url = regexp_replace(canonical_url, 'https://mediabuyinglondon\.co\.uk//+', 'https://mediabuyinglondon.co.uk/', 'g')
WHERE canonical_url LIKE 'https://mediabuyinglondon.co.uk//%';