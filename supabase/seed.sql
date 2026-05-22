insert into public.organizations (
  id,
  name,
  type,
  description,
  phone,
  email,
  address,
  province,
  status
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'Happy Paws Shop',
    'shop',
    'Pet supplies, grooming products, toys, food, and daily care essentials.',
    '020000001',
    'shop@example.com',
    '123 Pet Street',
    'Bangkok',
    'active'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Care Pet Clinic',
    'clinic',
    'General pet clinic for wellness checks, vaccines, and basic treatment.',
    '020000002',
    'clinic@example.com',
    '456 Clinic Road',
    'Bangkok',
    'active'
  )
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    status = excluded.status,
    updated_at = now();

insert into public.services (
  organization_id,
  name,
  description,
  price,
  duration_minutes,
  status
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'Basic grooming kit',
    'Starter set for everyday grooming.',
    450,
    null,
    'published'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Wellness check',
    'General checkup for dogs and cats.',
    650,
    30,
    'published'
  )
on conflict do nothing;

insert into public.news (
  organization_id,
  title,
  content,
  type,
  status,
  published_at
) values
  (
    null,
    'Welcome to Pet Platform',
    'Browse trusted pet shops and clinics in one place.',
    'global',
    'published',
    now()
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'Grooming essentials promotion',
    'Special offer for grooming kits this month.',
    'promotion',
    'published',
    now()
  )
on conflict do nothing;

insert into public.banners (
  title,
  image_url,
  link_type,
  link_value,
  position,
  status
) values
  (
    'Find pet care nearby',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80',
    'screen',
    'shops',
    1,
    'active'
  )
on conflict do nothing;
