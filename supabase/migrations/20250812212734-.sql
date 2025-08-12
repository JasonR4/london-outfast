begin;

-- Patch trigger function to avoid NOT NULL violations when auth.uid() is null during migrations
create or replace function public.update_seo_pages_updated_at()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  NEW.updated_at = now();
  NEW.updated_by = coalesce(auth.uid(), NEW.updated_by, NEW.created_by);
  return NEW;
end;
$function$;

-- Create backup table if missing
create table if not exists public.seo_canonical_backups (
  id uuid primary key default gen_random_uuid(),
  seo_page_id uuid not null,
  old_canonical_url text not null,
  new_canonical_url text,
  backed_up_at timestamptz not null default now()
);

-- Backup .com canonicals (idempotent)
insert into public.seo_canonical_backups (seo_page_id, old_canonical_url)
select id, canonical_url
from public.seo_pages sp
where sp.canonical_url ilike '%mediabuyinglondon.com%'
  and not exists (
    select 1 from public.seo_canonical_backups b
    where b.seo_page_id = sp.id and b.old_canonical_url = sp.canonical_url
  );

-- Replace .com with .co.uk
update public.seo_pages
set canonical_url = regexp_replace(canonical_url, '^https?://(www\.)?mediabuyinglondon\.com', 'https://mediabuyinglondon.co.uk')
where canonical_url ilike '%mediabuyinglondon.com%';

-- Store new canonicals in backup table
update public.seo_canonical_backups b
set new_canonical_url = p.canonical_url
from public.seo_pages p
where b.seo_page_id = p.id and b.new_canonical_url is null;

-- Cleanup accidental double slashes
update public.seo_pages
set canonical_url = regexp_replace(canonical_url, 'https://mediabuyinglondon\.co\.uk//+', 'https://mediabuyinglondon.co.uk/', 'g')
where canonical_url like 'https://mediabuyinglondon.co.uk//%';

commit;