# Next Checklist

## Must Do Before Real Users

- Run `supabase/migrations/202605220002_mobile_extensions.sql`.
- Create a real Super Admin in Supabase Auth and `public.users`.
- Run optional `supabase/seed.sql` for demo content.
- Replace `origin: '*'` CORS with allowed admin/mobile domains before production.
- Move service-role key to Cloudflare secret only; never expose it to frontend/mobile.
- Run `supabase/migrations/202605220003_storage_buckets.sql` for public image uploads.
- Confirm Supabase Storage upload rules in the Supabase dashboard.
- Add audit log rows for service/news/banner changes already covered by API.

## Backend Next

- Add organization services update endpoint.
- Add review moderation for admins.
- Add booking management for clinic/shop admins.
- Add frontend file picker integration for `/uploads/signed-url`.
- Add search/filter query params for mobile lists.
- Add stricter error codes for validation errors.

## Admin Web Next

- Add edit forms, not only create/delete.
- Add image upload flow.
- Add review moderation screen.
- Add booking management screen.
- Add pagination and search to tables.
- Add route-based navigation if screens grow further.

## Mobile Next

- Add login/signup.
- Add favorites screen backed by `/mobile/me/favorites`.
- Add booking flow backed by `/mobile/me/bookings`.
- Add review form backed by `/mobile/me/reviews`.
- Add maps and contact actions.
- Add push notification foundation.

## Verification

```bash
npm run typecheck
npm run build:admin
npm run smoke:api
```

Flutter verification after installing Flutter SDK:

```bash
cd mobile-app
flutter pub get
flutter analyze
flutter test
```
