# Next Checklist

## Must Do Before Real Users

- Run `supabase/migrations/202605220002_mobile_extensions.sql`.
- Create a real Super Admin in Supabase Auth and `public.users`.
- Run optional `supabase/seed.sql` for demo content. - done for current demo environment
- Replace `origin: '*'` CORS with allowed admin/mobile domains before production. - done for admin web
- Move service-role key to Cloudflare secret only; never expose it to frontend/mobile.
- Enable Cloudflare R2 and create bucket `pet-app-assets`.
- Add audit log rows for service/news/banner changes already covered by API.

## Backend Next

- Add organization services update endpoint. - done
- Add review moderation for admins. - done
- Add booking management for clinic/shop admins. - done
- Add frontend file picker integration for R2 uploads. - done for profile, services, news, banners
- Add search/filter query params for mobile lists.
- Add stricter error codes for validation errors.

## Admin Web Next

- Add edit forms, not only create/delete. - partially done with quick status edits for organizations, services, news, and banners
- Add image upload flow. - done for profile, services, news, banners; pending Cloudflare R2 enablement
- Add review moderation screen. - done
- Add booking management screen. - done
- Add pagination and search to tables. - client-side search done for current admin tables; full server-side pagination UI still pending
- Add route-based navigation if screens grow further.

## Mobile Next

- Add login/signup. - source done with `/auth/login` and `/auth/signup`
- Add favorites screen backed by `/mobile/me/favorites`. - profile display source done
- Add booking flow backed by `/mobile/me/bookings`. - source done with detail-page create flow and profile list
- Add review form backed by `/mobile/me/reviews`. - source done from organization detail
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
