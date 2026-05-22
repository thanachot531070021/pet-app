# API Reference

Base URL:

```text
http://localhost:8787/api
```

## Health

```text
GET /health
GET /health/db
```

## Auth

```text
POST /auth/login
GET  /auth/me
POST /auth/logout
```

Login body:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Use the returned `accessToken` as:

```text
Authorization: Bearer ACCESS_TOKEN
```

## Super Admin

Requires `super_admin`.

```text
GET    /super-admin/dashboard
GET    /super-admin/shops?page=1&perPage=50
POST   /super-admin/shops
PATCH  /super-admin/shops/:id
DELETE /super-admin/shops/:id

GET    /super-admin/clinics?page=1&perPage=50
POST   /super-admin/clinics
PATCH  /super-admin/clinics/:id
DELETE /super-admin/clinics/:id

GET    /super-admin/admins?page=1&perPage=50
POST   /super-admin/admins
PATCH  /super-admin/admins/:id
DELETE /super-admin/admins/:id

GET    /super-admin/banners?page=1&perPage=50
POST   /super-admin/banners
PATCH  /super-admin/banners/:id
DELETE /super-admin/banners/:id

GET    /super-admin/activity-logs?page=1&perPage=50
```

Create shop/clinic body:

```json
{
  "name": "Happy Paws",
  "description": "Pet shop",
  "phone": "020000001",
  "email": "shop@example.com",
  "address": "Bangkok",
  "status": "active"
}
```

Create admin body:

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

## Organization Admin

Requires `shop_admin` or `clinic_admin`.

```text
GET    /admin/dashboard
GET    /admin/profile
PATCH  /admin/profile
GET    /admin/services?page=1&perPage=50
POST   /admin/services
DELETE /admin/services/:id
```

Create service body:

```json
{
  "name": "Wellness check",
  "description": "General pet health check",
  "price": 650,
  "durationMinutes": 30,
  "status": "published"
}
```

## News

Requires admin auth for writes.

```text
GET    /news?page=1&perPage=50
GET    /news/:id
POST   /news
PATCH  /news/:id
DELETE /news/:id
```

Create global news:

```json
{
  "organizationId": null,
  "title": "Welcome",
  "content": "Welcome to Pet Platform",
  "type": "global",
  "status": "published",
  "publishedAt": "2026-05-22T00:00:00.000Z"
}
```

## Mobile Public

No auth required.

```text
GET /mobile/home
GET /mobile/shops?page=1&perPage=50&search=bangkok
GET /mobile/shops/:id
GET /mobile/clinics?page=1&perPage=50&search=clinic
GET /mobile/clinics/:id
GET /mobile/news?page=1&perPage=50&search=promotion
GET /mobile/news/:id
```

## Uploads

Requires `super_admin`, `shop_admin`, or `clinic_admin`.

```text
POST /uploads/signed-url
```

Body:

```json
{
  "folder": "organizations",
  "fileName": "cover.png",
  "contentType": "image/png"
}
```

The response includes `signedUrl`, `token`, `path`, and `publicUrl`. Upload the file to Supabase Storage with the signed upload URL, then save `publicUrl` in the relevant organization, banner, news, or service record.

Organization detail response includes:

```json
{
  "organization": {},
  "services": [],
  "reviewCount": 0
}
```

## Mobile Authenticated

Requires any logged-in user token.

```text
GET    /mobile/me/favorites?page=1&perPage=50
POST   /mobile/me/favorites
DELETE /mobile/me/favorites/:organizationId
POST   /mobile/me/reviews
GET    /mobile/me/bookings?page=1&perPage=50
POST   /mobile/me/bookings
```

Create favorite:

```json
{
  "organizationId": "ORGANIZATION_UUID"
}
```

Create review:

```json
{
  "organizationId": "ORGANIZATION_UUID",
  "rating": 5,
  "comment": "Great service"
}
```

Create booking:

```json
{
  "organizationId": "ORGANIZATION_UUID",
  "serviceId": "SERVICE_UUID",
  "scheduledAt": "2026-05-23T10:00:00.000Z",
  "note": "First visit"
}
```
