insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'public-assets',
    'public-assets',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "public assets are readable"
on storage.objects for select
using (bucket_id = 'public-assets');

create policy "admins can upload public assets"
on storage.objects for insert
with check (
  bucket_id = 'public-assets'
  and (
    public.is_super_admin()
    or exists (
      select 1
      from public.organization_admins oa
      where oa.user_id = auth.uid()
    )
  )
);

create policy "admins can update public assets"
on storage.objects for update
using (
  bucket_id = 'public-assets'
  and (
    public.is_super_admin()
    or exists (
      select 1
      from public.organization_admins oa
      where oa.user_id = auth.uid()
    )
  )
)
with check (
  bucket_id = 'public-assets'
  and (
    public.is_super_admin()
    or exists (
      select 1
      from public.organization_admins oa
      where oa.user_id = auth.uid()
    )
  )
);
