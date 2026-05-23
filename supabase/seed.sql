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
  id,
  organization_id,
  name,
  description,
  price,
  duration_minutes,
  status
) values
  (
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'Basic grooming kit',
    'Starter set for everyday grooming.',
    450,
    null,
    'published'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '22222222-2222-4222-8222-222222222222',
    'Wellness check',
    'General checkup for dogs and cats.',
    650,
    30,
    'published'
  )
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    duration_minutes = excluded.duration_minutes,
    status = excluded.status,
    updated_at = now();

insert into public.news (
  id,
  organization_id,
  title,
  content,
  type,
  status,
  published_at
) values
  (
    '55555555-5555-4555-8555-555555555555',
    null,
    'Welcome to Pet Platform',
    'Browse trusted pet shops and clinics in one place.',
    'global',
    'published',
    now()
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    '11111111-1111-4111-8111-111111111111',
    'Grooming essentials promotion',
    'Special offer for grooming kits this month.',
    'promotion',
    'published',
    now()
  )
on conflict (id) do update
set title = excluded.title,
    content = excluded.content,
    type = excluded.type,
    status = excluded.status,
    published_at = excluded.published_at,
    updated_at = now();

insert into public.banners (
  id,
  title,
  image_url,
  link_type,
  link_value,
  position,
  status
) values
  (
    '77777777-7777-4777-8777-777777777777',
    'Find pet care nearby',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80',
    'screen',
    'shops',
    1,
    'active'
  )
on conflict (id) do update
set title = excluded.title,
    image_url = excluded.image_url,
    link_type = excluded.link_type,
    link_value = excluded.link_value,
    position = excluded.position,
    status = excluded.status,
    updated_at = now();
