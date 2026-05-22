create extension if not exists "pgcrypto";

create type public.user_role as enum ('super_admin', 'shop_admin', 'clinic_admin', 'user');
create type public.organization_type as enum ('shop', 'clinic');
create type public.organization_status as enum ('active', 'inactive', 'pending', 'suspended');
create type public.organization_admin_role as enum ('owner', 'manager', 'staff');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.banner_status as enum ('active', 'inactive');
create type public.review_status as enum ('pending', 'published', 'hidden');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  role public.user_role not null default 'user',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.organization_type not null,
  description text,
  logo_url text,
  cover_url text,
  phone text,
  email text,
  address text,
  province text,
  district text,
  subdistrict text,
  latitude double precision,
  longitude double precision,
  status public.organization_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role public.organization_admin_role not null default 'manager',
  created_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12, 2),
  duration_minutes integer,
  image_url text,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  content text not null,
  cover_image text,
  type text not null check (type in ('global', 'shop', 'clinic', 'promotion', 'announcement')),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_type text,
  link_value text,
  position integer not null default 0,
  status public.banner_status not null default 'inactive',
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  icon_url text,
  status public.banner_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  unique (organization_id, category_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  action text not null,
  module text not null,
  description text not null,
  ip_address text,
  created_at timestamptz not null default now()
);

create index organizations_type_status_idx on public.organizations(type, status);
create index organization_admins_user_id_idx on public.organization_admins(user_id);
create index organization_admins_organization_id_idx on public.organization_admins(organization_id);
create index services_organization_id_status_idx on public.services(organization_id, status);
create index news_organization_id_status_idx on public.news(organization_id, status);
create index news_status_published_at_idx on public.news(status, published_at desc);
create index banners_status_position_idx on public.banners(status, position);
create index reviews_organization_id_status_idx on public.reviews(organization_id, status);
create index activity_logs_user_id_idx on public.activity_logs(user_id);
create index activity_logs_organization_id_idx on public.activity_logs(organization_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger set_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create trigger set_news_updated_at
before update on public.news
for each row execute function public.set_updated_at();

create trigger set_banners_updated_at
before update on public.banners
for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger set_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'super_admin', false)
$$;

create or replace function public.can_access_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.organization_admins oa
      where oa.user_id = auth.uid()
        and oa.organization_id = target_organization_id
    )
$$;

alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_admins enable row level security;
alter table public.services enable row level security;
alter table public.news enable row level security;
alter table public.banners enable row level security;
alter table public.categories enable row level security;
alter table public.organization_categories enable row level security;
alter table public.reviews enable row level security;
alter table public.activity_logs enable row level security;

create policy "users can read own profile"
on public.users for select
using (id = auth.uid() or public.is_super_admin());

create policy "active organizations are public"
on public.organizations for select
using (status = 'active' or public.can_access_organization(id));

create policy "admins can update own organization"
on public.organizations for update
using (public.can_access_organization(id))
with check (public.can_access_organization(id));

create policy "super admins can manage organizations"
on public.organizations for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admins can read memberships"
on public.organization_admins for select
using (user_id = auth.uid() or public.is_super_admin() or public.can_access_organization(organization_id));

create policy "super admins can manage memberships"
on public.organization_admins for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "published services are public"
on public.services for select
using (status = 'published' or public.can_access_organization(organization_id));

create policy "admins can manage own services"
on public.services for all
using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

create policy "published news is public"
on public.news for select
using (
  status = 'published'
  or public.is_super_admin()
  or (organization_id is not null and public.can_access_organization(organization_id))
);

create policy "admins can manage scoped news"
on public.news for all
using (organization_id is not null and public.can_access_organization(organization_id))
with check (organization_id is not null and public.can_access_organization(organization_id));

create policy "super admins can manage all news"
on public.news for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "active banners are public"
on public.banners for select
using (status = 'active' or public.is_super_admin());

create policy "super admins can manage banners"
on public.banners for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "active categories are public"
on public.categories for select
using (status = 'active' or public.is_super_admin());

create policy "super admins can manage categories"
on public.categories for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "organization categories follow organization"
on public.organization_categories for select
using (public.can_access_organization(organization_id));

create policy "super admins manage organization categories"
on public.organization_categories for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "published reviews are public"
on public.reviews for select
using (status = 'published' or user_id = auth.uid() or public.can_access_organization(organization_id));

create policy "users create own reviews"
on public.reviews for insert
with check (user_id = auth.uid());

create policy "users update own pending reviews"
on public.reviews for update
using (user_id = auth.uid() and status = 'pending')
with check (user_id = auth.uid());

create policy "admins read activity logs"
on public.activity_logs for select
using (public.is_super_admin() or public.can_access_organization(organization_id));

create policy "super admins insert activity logs"
on public.activity_logs for insert
with check (public.is_super_admin() or public.can_access_organization(organization_id));
