import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { AppVariables } from '../types/app';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';
import { createSupabaseAdmin } from '../lib/supabase';
import { getOrganization, updateOrganization } from '../services/organization.service';
import { writeActivityLog } from '../services/activity-log.service';
import { createService, deleteService, listServices } from '../services/service.service';
import { success } from '../utils/response';
import { organizationStatusSchema, paginationSchema, uuidSchema } from '../utils/validation';
import { forbidden } from '../utils/error';

export const adminRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

adminRoute.use('*', authMiddleware, requireRoles('shop_admin', 'clinic_admin'));

adminRoute.get('/dashboard', async (c) => {
  const user = c.get('authUser');
  return c.json(success({ organizationIds: user.organizationIds }));
});

adminRoute.get('/profile', async (c) => {
  const user = c.get('authUser');
  const organizationId = user.organizationIds[0];
  if (!organizationId) throw forbidden('No organization assigned');

  const supabase = createSupabaseAdmin(c.env);
  const organization = await getOrganization(supabase, organizationId);

  return c.json(success(organization));
});

adminRoute.patch(
  '/profile',
  zValidator(
    'json',
    z
      .object({
        name: z.string().min(1).optional(),
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
        status: organizationStatusSchema.optional(),
      })
      .refine((value) => Object.keys(value).length > 0, 'At least one field is required'),
  ),
  async (c) => {
    const user = c.get('authUser');
    const organizationId = user.organizationIds[0];
    if (!organizationId) throw forbidden('No organization assigned');

    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const organization = await updateOrganization(supabase, organizationId, body);
    await writeActivityLog(supabase, {
      userId: user.id,
      organizationId,
      action: 'update',
      module: 'organizations',
      description: `Updated own organization ${organization.name}`,
      ipAddress: c.req.header('cf-connecting-ip') ?? null,
    });

    return c.json(success(organization));
  },
);

adminRoute.get('/services', zValidator('query', paginationSchema), async (c) => {
  const user = c.get('authUser');
  const organizationId = user.organizationIds[0];
  if (!organizationId) throw forbidden('No organization assigned');

  const query = c.req.valid('query');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listServices(supabase, { ...query, organizationId });

  return c.json(success(result));
});

adminRoute.post(
  '/services',
  zValidator(
    'json',
    z.object({
      name: z.string().min(1),
      description: z.string().nullish(),
      price: z.number().nonnegative().nullish(),
      durationMinutes: z.number().int().positive().nullish(),
      imageUrl: z.string().url().nullish(),
      status: z.enum(['draft', 'published', 'archived']).default('published'),
    }),
  ),
  async (c) => {
    const user = c.get('authUser');
    const organizationId = user.organizationIds[0];
    if (!organizationId) throw forbidden('No organization assigned');

    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const service = await createService(supabase, { ...body, organizationId });
    await writeActivityLog(supabase, {
      userId: user.id,
      organizationId,
      action: 'create',
      module: 'services',
      description: `Created service ${service.name}`,
      ipAddress: c.req.header('cf-connecting-ip') ?? null,
    });

    return c.json(success(service), 201);
  },
);

adminRoute.delete('/services/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const user = c.get('authUser');
  const organizationId = user.organizationIds[0];
  if (!organizationId) throw forbidden('No organization assigned');

  const { id } = c.req.valid('param');
  const supabase = createSupabaseAdmin(c.env);
  await deleteService(supabase, id, organizationId);
  await writeActivityLog(supabase, {
    userId: user.id,
    organizationId,
    action: 'delete',
    module: 'services',
    description: `Deleted service ${id}`,
    ipAddress: c.req.header('cf-connecting-ip') ?? null,
  });

  return c.json(success({ deleted: true }));
});
