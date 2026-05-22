# Setup

## Backend

Install dependencies:

```bash
npm install
```

Copy local Worker variables:

```bash
cp backend/.dev.vars.example backend/.dev.vars
```

Fill in:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Run backend locally:

```bash
npm run dev:backend
```

Health check:

```bash
curl http://localhost:8787/api/health
```

Database/schema check:

```bash
curl http://localhost:8787/api/health/db
```

Admin web:

```bash
npm run dev:admin
```

Open:

```text
http://localhost:5173
```

## Mobile App

Flutter SDK is required for local mobile runs.

Install dependencies:

```bash
cd mobile-app
flutter pub get
```

Run for Windows desktop or web against the local backend:

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:8787/api
```

Run for Android emulator against the local backend:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8787/api
```

## Supabase

Apply migrations with the Supabase CLI or paste the SQL from:

```text
supabase/migrations/202605220001_initial_schema.sql
supabase/migrations/202605220002_mobile_extensions.sql
supabase/migrations/202605220003_storage_buckets.sql
```

Create the first user in Supabase Auth, then set that profile as Super Admin:

```sql
insert into public.users (id, email, full_name, role)
values (
  'AUTH_USER_UUID',
  'admin@example.com',
  'Super Admin',
  'super_admin'
)
on conflict (id) do update
set role = 'super_admin',
    email = excluded.email,
    full_name = excluded.full_name;
```

After the Super Admin can login, create shop/clinic admins through:

```text
POST /api/super-admin/admins
```

Payload:

```json
{
  "email": "shop-admin@example.com",
  "password": "change-this-password",
  "fullName": "Shop Admin",
  "role": "shop_admin",
  "organizationId": "ORGANIZATION_UUID",
  "organizationRole": "owner"
}
```

For production, set Worker secrets:

```bash
cd backend
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Optional demo data:

```text
supabase/seed.sql
```

API smoke test:

```bash
npm run smoke:api
```
