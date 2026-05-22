create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  scheduled_at timestamptz not null,
  status public.booking_status not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index favorites_user_id_idx on public.favorites(user_id);
create index favorites_organization_id_idx on public.favorites(organization_id);
create index bookings_user_id_idx on public.bookings(user_id);
create index bookings_organization_id_status_idx on public.bookings(organization_id, status);

create trigger set_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

alter table public.favorites enable row level security;
alter table public.bookings enable row level security;

create policy "users manage own favorites"
on public.favorites for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users read own bookings"
on public.bookings for select
using (user_id = auth.uid() or public.can_access_organization(organization_id));

create policy "users create own bookings"
on public.bookings for insert
with check (user_id = auth.uid());

create policy "users update own pending bookings"
on public.bookings for update
using (user_id = auth.uid() and status = 'pending')
with check (user_id = auth.uid());
