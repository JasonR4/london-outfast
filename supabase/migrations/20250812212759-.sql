begin;

-- Secure the backup table created earlier
alter table if exists public.seo_canonical_backups enable row level security;

-- Allow only admins to view backups (no insert/update/delete from the app)
create policy if not exists "Admins can view canonical backups"
  on public.seo_canonical_backups
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.role = any (array['super_admin','admin'])
    )
  );

commit;