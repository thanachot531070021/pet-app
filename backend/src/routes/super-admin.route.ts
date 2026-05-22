import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { AppVariables } from '../types/app';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';
import { createSupabaseAdmin } from '../lib/supabase';
import {
  createOrganization,
  deleteOrganization,
  listOrganizations,
  updateOrganization,
} from '../services/organization.service';
import { createAdmin, deactivateAdmin, listAdmins, updateAdmin } from '../services/user.service';
import { listActivityLogs, writeActivityLog } from '../services/activity-log.service';
import { createBanner, deleteBanner, listBanners, updateBanner } from '../services/banner.service';
import { success } from '../utils/response';
import {
  organizationAdminRoleSchema,
  organizationStatusSchema,
  organizationTypeSchema,
  paginationSchema,
  uuidSchema,
} from '../utils/validation';

export const superAdminRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

superAdminRoute.use('*', authMiddleware, requireRoles('super_admin'));

const organizationBaseSchema = z.object({
  name: z.string().min(1),
  type: organizationTypeSchema,
  description: z.string().nullish(),
  logoUrl: z.string().url().nullish(),
  coverUrl: z.string().url().nullish(),
  phone: z.string().nullish(),
  email: z.string().email().nullish(),
  address: z.string().nullish(),
  province: z.string().nullish(),
  district: z.string().nullish(),
  subdistrict: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  status: organizationStatusSchema.default('pending'),
});

const createShopOrClinicSchema = organizationBaseSchema.omit({ type: true });

const updateShopOrClinicSchema = createShopOrClinicSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
);

superAdminRoute.get('/dashboard', async (c) => {
  const supabase = createSupabaseAdmin(c.env);
  const [organizations, users, news] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('news').select('id', { count: 'exact', head: true }),
  ]);

  return c.json(
    success({
      organizations: organizations.count ?? 0,
      users: users.count ?? 0,
      news: news.count ?? 0,
    }),
  );
});

superAdminRoute.get('/shops', zValidator('query', paginationSchema), async (c) => {
  const query = c.req.valid('query');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listOrganizations(supabase, { ...query, type: 'shop' });

  return c.json(success(result));
});

superAdminRoute.post('/shops', zValidator('json', createShopOrClinicSchema), async (c) => {
  const body = c.req.valid('json');
  const supabase = createSupabaseAdmin(c.env);
  const organization = await createOrganization(supabase, { ...body, type: 'shop' });
  await writeActivityLog(supabase, {
    userId: c.get('authUser').id,
    organizationId: organization.id,
    action: 'create',
    module: 'organizations',
    description: `Created shop ${organization.name}`,
    ipAddress: c.req.header('cf-connecting-ip') ?? null,
  });

  return c.json(success(organization), 201);
});

superAdminRoute.patch(
  '/shops/:id',
  zValidator('param', z.object({ id: uuidSchema })),
  zValidator('json', updateShopOrClinicSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const organization = await updateOrganization(supabase, id, body);
    await writeActivityLog(supabase, {
      userId: c.get('authUser').id,
      organizationId: id,
      action: 'update',
      module: 'organizations',
      description: `Updated shop ${organization.name}`,
      ipAddress: c.req.header('cf-connecting-ip') ?? null,
    });

    return c.json(success(organization));
  },
);

superAdminRoute.delete('/shops/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid('param');
  const supabase = createSupabaseAdmin(c.env);
  await deleteOrganization(supabase, id);
  await writeActivityLog(supabase, {
    userId: c.get('authUser').id,
    organizationId: id,
    action: 'delete',
    module: 'organizations',
    description: `Deleted shop ${id}`,
    ipAddress: c.req.header('cf-connecting-ip') ?? null,
  });

  return c.json(success({ deleted: true }));
});

superAdminRoute.get('/clinics', zValidator('query', paginationSchema), async (c) => {
  const query = c.req.valid('query');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listOrganizations(supabase, { ...query, type: 'clinic' });

  return c.json(success(result));
});

superAdminRoute.post(
  '/clinics',
  zValidator('json', createShopOrClinicSchema),
  async (c) => {
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const organization = await createOrganization(supabase, { ...body, type: 'clinic' });
    await writeActivityLog(supabase, {
      userId: c.get('authUser').id,
      organizationId: organization.id,
      action: 'create',
      module: 'organizations',
      description: `Created clinic ${organization.name}`,
      ipAddress: c.req.header('cf-connecting-ip') ?? null,
    });

    return c.json(success(organization), 201);
  },
);

superAdminRoute.patch(
  '/clinics/:id',
  zValidator('param', z.object({ id: uuidSchema })),
  zValidator('json', updateShopOrClinicSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const organization = await updateOrganization(supabase, id, body);
    await writeActivityLog(supabase, {
      userId: c.get('authUser').id,
      organizationId: id,
      action: 'update',
      module: 'organizations',
      description: `Updated clinic ${organization.name}`,
      ipAddress: c.req.header('cf-connecting-ip') ?? null,
    });

    return c.json(success(organization));
  },
);

superAdminRoute.delete('/clinics/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid('param');
  const supabase = createSupabaseAdmin(c.env);
  await deleteOrganization(supabase, id);
  await writeActivityLog(supabase, {
    userId: c.get('authUser').id,
    organizationId: id,
    action: 'delete',
    module: 'organizations',
    description: `Deleted clinic ${id}`,
    ipAddress: c.req.header('cf-connecting-ip') ?? null,
  });

  return c.json(success({ deleted: true }));
});

superAdminRoute.get(
  '/admins',
  zValidator('query', paginationSchema.extend({ organizationId: uuidSchema.optional() })),
  async (c) => {
    const query = c.req.valid('query');
    const supabase = createSupabaseAdmin(c.env);
    const result = await listAdmins(supabase, query);

    return c.json(success(result));
  },
);

superAdminRoute.post(
  '/admins',
  zValidator(
    'json',
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      fullName: z.string().min(1),
      phone: z.string().nullish(),
      role: z.enum(['shop_admin', 'clinic_admin']),
      organizationId: uuidSchema,
      organizationRole: organizationAdminRoleSchema.default('manager'),
    }),
  ),
  async (c) => {
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const admin = await createAdmin(supabase, body);
    await writeActivityLog(supabase, {
      userId: c.get('authUser').id,
      organizationId: body.organizationId,
      action: 'create',
      module: 'organization_admins',
      description: `Created admin ${body.email}`,
      ipAddress: c.req.header('cf-connecting-ip') ?? null,
    });

    return c.json(success(admin), 201);
  },
);

superAdminRoute.patch(
  '/admins/:id',
  zValidator('param', z.object({ id: uuidSchema })),
  zValidator(
    'json',
    z
      .object({
        email: z.string().email().optional(),
        password: z.string().min(8).optional(),
        fullName: z.string().min(1).optional(),
        phone: z.string().nullish(),
        role: z.enum(['shop_admin', 'clinic_admin']).optional(),
        avatarUrl: z.string().url().nullish(),
        organizationId: uuidSchema.optional(),
        organizationRole: organizationAdminRoleSchema.optional(),
      })
      .refine((value) => Object.keys(value).length > 0, 'At least one field is required'),
  ),
  async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const admin = await updateAdmin(supabase, id, body);
    await writeActivityLog(supabase, {
      userId: c.get('authUser').id,
      organizationId: body.organizationId ?? null,
      action: 'update',
      module: 'organization_admins',
      description: `Updated admin ${id}`,
      ipAddress: c.req.header('cf-connecting-ip') ?? null,
    });

    return c.json(success(admin));
  },
);

superAdminRoute.delete('/admins/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid('param');
  const supabase = createSupabaseAdmin(c.env);
  await deactivateAdmin(supabase, id);
  await writeActivityLog(supabase, {
    userId: c.get('authUser').id,
    organizationId: null,
    action: 'delete',
    module: 'organization_admins',
    description: `Deactivated admin ${id}`,
    ipAddress: c.req.header('cf-connecting-ip') ?? null,
  });

  return c.json(success({ deactivated: true }));
});

const bannerBodySchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().url(),
  linkType: z.string().nullish(),
  linkValue: z.string().nullish(),
  position: z.number().int().min(0).default(0),
  status: z.enum(['active', 'inactive']).default('inactive'),
  startDate: z.string().datetime().nullish(),
  endDate: z.string().datetime().nullish(),
});

superAdminRoute.get('/banners', zValidator('query', paginationSchema), async (c) => {
  const query = c.req.valid('query');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listBanners(supabase, query);

  return c.json(success(result));
});

superAdminRoute.post('/banners', zValidator('json', bannerBodySchema), async (c) => {
  const body = c.req.valid('json');
  const supabase = createSupabaseAdmin(c.env);
  const banner = await createBanner(supabase, body);
  await writeActivityLog(supabase, {
    userId: c.get('authUser').id,
    organizationId: null,
    action: 'create',
    module: 'banners',
    description: `Created banner ${banner.title}`,
    ipAddress: c.req.header('cf-connecting-ip') ?? null,
  });

  return c.json(success(banner), 201);
});

superAdminRoute.patch(
  '/banners/:id',
  zValidator('param', z.object({ id: uuidSchema })),
  zValidator('json', bannerBodySchema.partial().refine((value) => Object.keys(value).length > 0)),
  async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const banner = await updateBanner(supabase, id, body);
    await writeActivityLog(supabase, {
      userId: c.get('authUser').id,
      organizationId: null,
      action: 'update',
      module: 'banners',
      description: `Updated banner ${banner.title}`,
      ipAddress: c.req.header('cf-connecting-ip') ?? null,
    });

    return c.json(success(banner));
  },
);

superAdminRoute.delete('/banners/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid('param');
  const supabase = createSupabaseAdmin(c.env);
  await deleteBanner(supabase, id);
  await writeActivityLog(supabase, {
    userId: c.get('authUser').id,
    organizationId: null,
    action: 'delete',
    module: 'banners',
    description: `Deleted banner ${id}`,
    ipAddress: c.req.header('cf-connecting-ip') ?? null,
  });

  return c.json(success({ deleted: true }));
});

superAdminRoute.get('/activity-logs', zValidator('query', paginationSchema), async (c) => {
  const query = c.req.valid('query');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listActivityLogs(supabase, query);

  return c.json(success(result));
});
