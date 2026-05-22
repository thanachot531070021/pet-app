# Pet Platform Project Plan

## เป้าหมายระบบ

สร้างแพลตฟอร์มกลางสำหรับหลายร้านค้าและหลายคลินิก โดยมี Web Admin สำหรับจัดการข้อมูล และ Flutter Mobile App สำหรับผู้ใช้ทั่วไป ข้อมูลของร้าน/คลินิกต้องแยกตาม `organization_id` และทุก API ต้องตรวจ role ก่อนทำงานสำคัญ

## Architecture

```text
Admin Web
  -> Cloudflare Worker API
    -> Supabase Auth + Postgres + Storage

Flutter App
  -> Cloudflare Worker API
    -> Supabase Auth + Postgres + Storage
```

หลักสำคัญ: ให้ Cloudflare Worker เป็นตัวกลางสำหรับ validation, permission, business logic, activity log และ tenant isolation

## Tech Stack

- Backend: Cloudflare Worker, Hono.js, TypeScript, Supabase JS Client, Zod
- Admin Web: React + Vite หรือ Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod
- Mobile: Flutter, Dio, Riverpod หรือ Bloc, GoRouter, Secure Storage
- Database: Supabase PostgreSQL, Supabase Auth, Supabase Storage, Row Level Security

## MVP Scope

1. Login
2. Role: `super_admin`, `shop_admin`, `clinic_admin`, `user`
3. Super Admin เพิ่มร้าน/คลินิก
4. Super Admin เพิ่ม Admin ให้ร้าน/คลินิก
5. Admin แก้ข้อมูลร้าน/คลินิกของตัวเอง
6. ข่าวสารและ banner
7. Flutter ดึงรายการร้าน/คลินิก/ข่าวสารมาแสดง

## Database หลัก

- `users`
- `organizations`
- `organization_admins`
- `services`
- `news`
- `banners`
- `categories`
- `organization_categories`
- `reviews`
- `favorites`
- `bookings`
- `activity_logs`

## Permission Rules

- Super Admin ทำได้ทั้งระบบ
- Shop Admin ทำได้เฉพาะ organization type `shop` ที่ตัวเองถูกผูกไว้
- Clinic Admin ทำได้เฉพาะ organization type `clinic` ที่ตัวเองถูกผูกไว้
- User อ่านข้อมูลผ่าน Mobile App และใช้ฟีเจอร์ user-facing
- Mobile public API ส่งคืนเฉพาะข้อมูล `active` / `published`
- Admin ย่อยห้าม query หรือแก้ข้อมูลข้าม `organization_id`

## API Plan

```text
/api/auth
  POST /login
  POST /logout
  GET  /me

/api/super-admin
  GET    /dashboard
  GET    /shops
  POST   /shops
  PATCH  /shops/:id
  DELETE /shops/:id
  GET    /clinics
  POST   /clinics
  PATCH  /clinics/:id
  DELETE /clinics/:id
  GET    /admins
  POST   /admins
  PATCH  /admins/:id
  DELETE /admins/:id
  GET    /banners
  POST   /banners
  PATCH  /banners/:id
  DELETE /banners/:id
  GET    /activity-logs

/api/admin
  GET   /dashboard
  GET   /profile
  PATCH /profile
  GET   /services
  POST  /services
  DELETE /services/:id

/api/news
  GET    /news
  POST   /news
  PATCH  /news/:id
  DELETE /news/:id

/api/mobile
  GET /home
  GET /shops
  GET /shops/:id
  GET /clinics
  GET /clinics/:id
  GET /news
  GET /news/:id
```

## Phase Plan

### Phase 1: Foundation

- สร้าง Supabase project
- ออกแบบ database และ RLS
- สร้าง Cloudflare Worker
- เชื่อม Worker กับ Supabase
- ทำ login, `/me`, role middleware, tenant middleware
- seed Super Admin

ผลลัพธ์: login ได้ รู้ role และ API กันสิทธิ์พื้นฐานได้

### Phase 2: Super Admin Web

- Dashboard รวม - ทำแล้ว
- CRUD ร้านค้า - ทำ create/list/delete แล้ว
- CRUD คลินิก - ทำ create/list/delete แล้ว
- จัดการ Admin ของร้าน/คลินิก - ทำ create/list/deactivate แล้ว
- จัดการข่าวสารส่วนกลาง - ทำ create/list/delete แล้ว
- จัดการ banner - ทำ create/list/delete แล้ว
- ดู activity log - ทำ list แล้ว

ผลลัพธ์: Super Admin จัดการข้อมูลหลักของระบบได้

### Phase 3: Shop/Clinic Admin Web

- Dashboard ของตัวเอง - ทำแล้ว
- แก้ไขข้อมูลร้าน/คลินิก - ทำแล้ว
- จัดการบริการ - ทำ create/list/delete แล้ว
- จัดการข่าวสารของตัวเอง - ทำ create/list/delete แล้ว
- รูปภาพ/โปรโมชั่นแยกละเอียด - ยังเหลือสำหรับรอบถัดไป
- ดูรีวิวและรายงานพื้นฐาน

ผลลัพธ์: Admin แต่ละร้าน/คลินิกจัดการข้อมูลตัวเองได้และไม่เห็นข้อมูลคนอื่น

### Phase 4: Flutter App

- Home - ทำ source แล้ว
- รายการร้านค้าและรายละเอียด - ทำ source แล้ว
- รายการคลินิกและรายละเอียด - ทำ source แล้ว
- ข่าวสาร - ทำ source แล้ว
- ค้นหา - ทำค้นหาใน list แล้ว
- Profile - ทำ placeholder แล้ว
- Favorite เวอร์ชันแรก - ยังเหลือสำหรับรอบถัดไป

ผลลัพธ์: ผู้ใช้ทั่วไปเปิดแอปแล้วดูข้อมูลจากระบบกลางได้

### Phase 5: Extensions

- จองคิว
- แจ้งเตือน
- รีวิว
- Chat
- Payment
- ระบบสมาชิก/สะสมแต้ม
- รายงานเชิงลึก

## Next Implementation Order

1. สร้าง `backend/` และ setup Hono Worker
2. สร้าง schema migration สำหรับ Supabase
3. ทำ auth middleware + role middleware + tenant middleware
4. ทำ organization CRUD สำหรับ Super Admin
5. ทำ admin profile update แบบ tenant-scoped
6. ทำ news/banner
7. เริ่ม admin web login/dashboard
8. เริ่ม Flutter public API integration

## Current Status

- Phase 1: backend foundation, auth, roles, tenant rules, schema - done
- Phase 2: Super Admin web for dashboard, shops, clinics, admins, news, banners, logs - usable
- Phase 3: Shop/Clinic Admin web for profile, services, own news - usable
- Phase 4: Flutter source for public browsing - source ready, Flutter SDK not installed on this machine
- Phase 5: favorites, reviews, bookings schema/API foundation - partly done; run second migration before use
