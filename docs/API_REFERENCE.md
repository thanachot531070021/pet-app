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
POST /auth/signup
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

Signup body:

```json
{
  "email": "user@example.com",
  "password": "User@123456",
  "fullName": "Pet Owner",
  "phone": "0800000000"
}
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
PATCH  /admin/services/:id
DELETE /admin/services/:id
GET    /admin/reviews?page=1&perPage=50
PATCH  /admin/reviews/:id
GET    /admin/bookings?page=1&perPage=50
PATCH  /admin/bookings/:id
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

Update service body:

```json
{
  "status": "draft"
}
```

Moderate review body:

```json
{
  "status": "published"
}
```

Allowed review statuses: `pending`, `published`, `hidden`.

Update booking body:

```json
{
  "status": "confirmed"
}
```

Allowed booking statuses: `pending`, `confirmed`, `cancelled`, `completed`.

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
POST /uploads/direct
GET  /assets/:path
```

`POST /uploads/direct` stores the file in Cloudflare R2 and returns a Worker-served public URL.

Multipart form fields:

```text
folder=organizations|banners|news|services
file=<JPEG, PNG, or WebP>
```

JSON response:

```json
{
  "bucket": "pet-app-assets",
  "path": "banners/system/file.png",
  "publicUrl": "https://pet-app-api.thanachot-jo888.workers.dev/api/assets/banners/system/file.png",
  "contentType": "image/png",
  "size": 12345
}
```

Legacy signed URL body:

```json
{
  "folder": "organizations",
  "fileName": "cover.png",
  "contentType": "image/png"
}
```

The legacy response includes `path` and `publicUrl`, but the current admin web uses direct R2 upload.

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
