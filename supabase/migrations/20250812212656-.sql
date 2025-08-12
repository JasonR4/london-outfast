begin;

-- 0) Create a backup table for canonical URL changes (one-off audit trail)
create table if not exists public.seo_canonical_backups (
  id uuid primary key default gen_random_uuid(),
  seo_page_id uuid not null,
  old_canonical_url text not null,
  new_canonical_url text,
  backed_up_at timestamptz not null default now()
);

-- 1) Backup existing canonicals that still point to .com
insert into public.seo_canonical_backups (seo_page_id, old_canonical_url)
select id, canonical_url
from public.seo_pages
where canonical_url ilike '%mediabuyinglondon.com%';

-- 2) Preempt NOT NULL violations on updated_by
update public.seo_pages
set updated_by = coalesce(updated_by, created_by)
where updated_by is null;

-- 3) Replace any .com domains with .co.uk in canonical_url
update public.seo_pages
set canonical_url = regexp_replace(canonical_url, '^https?://(www\.)?mediabuyinglondon\.com', 'https://mediabuyinglondon.co.uk'),
    updated_by = coalesce(updated_by, created_by),
    updated_at = now()
where canonical_url ilike '%mediabuyinglondon.com%';

-- 4) Record the new canonical values in the backup table
update public.seo_canonical_backups b
set new_canonical_url = p.canonical_url
from public.seo_pages p
where b.seo_page_id = p.id and b.new_canonical_url is null;

-- 5) Cleanup any accidental double slashes after the domain
update public.seo_pages
set canonical_url = regexp_replace(canonical_url, 'https://mediabuyinglondon\.co\.uk//+', 'https://mediabuyinglondon.co.uk/', 'g'),
    updated_by = coalesce(updated_by, created_by),
    updated_at = now()
where canonical_url like 'https://mediabuyinglondon.co.uk//%';

commit;