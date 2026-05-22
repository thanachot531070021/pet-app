import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { AppVariables } from '../types/app';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';
import { createSupabaseAdmin } from '../lib/supabase';
import { createNews, deleteNews, getNews, listNews, updateNews } from '../services/news.service';
import { writeActivityLog } from '../services/activity-log.service';
import { success } from '../utils/response';
import { paginationSchema, uuidSchema } from '../utils/validation';
import { forbidden } from '../utils/error';

export const newsRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

newsRoute.use('*', authMiddleware, requireRoles('super_admin', 'shop_admin', 'clinic_admin'));

const newsBodySchema = z.object({
  organizationId: uuidSchema.nullish(),
  title: z.string().min(1),
  content: z.string().min(1),
  coverImage: z.string().url().nullish(),
  type: z.enum(['global', 'shop', 'clinic', 'promotion', 'announcement']),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.string().datetime().nullish(),
});

const newsPatchSchema = newsBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
);

function assertNewsScope(user: AppVariables['authUser'], organizationId?: string | null) {
  if (user.role === 'super_admin') return;
  if (organizationId && user.organizationIds.includes(organizationId)) return;

  throw forbidden('You cannot manage news for another organization');
}

newsRoute.get('/', zValidator('query', paginationSchema), async (c) => {
  const user = c.get('authUser');
  const query = c.req.valid('query');
  const supabase = createSupabaseAdmin(c.env);
  const result =
    user.role === 'super_admin'
      ? await listNews(supabase, { ...query })
      : await listNews(supabase, {
          ...query,
          organizationIds: user.organizationIds,
          includeGlobal: true,
        });

  return c.json(success(result));
});

newsRoute.get('/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('authUser');
  const supabase = createSupabaseAdmin(c.env);
  const item = await getNews(supabase, id);
  assertNewsScope(user, item.organization_id);

  return c.json(success(item));
});

newsRoute.post('/', zValidator('json', newsBodySchema), async (c) => {
  const user = c.get('authUser');
  const body = c.req.valid('json');
  assertNewsScope(user, body.organizationId);

  const supabase = createSupabaseAdmin(c.env);
  const item = await createNews(supabase, { ...body, createdBy: user.id });
  await writeActivityLog(supabase, {
    userId: user.id,
    organizationId: body.organizationId,
    action: 'create',
    module: 'news',
    description: `Created news ${item.title}`,
    ipAddress: c.req.header('cf-connecting-ip') ?? null,
  });

  return c.json(success(item), 201);
});

newsRoute.patch(
  '/:id',
  zValidator('param', z.object({ id: uuidSchema })),
  zValidator('json', newsPatchSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('authUser');
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const existing = await getNews(supabase, id);
    assertNewsScope(user, existing.organization_id);
    if ('organizationId' in body) assertNewsScope(user, body.organizationId);

    const item = await updateNews(supabase, id, body);
    await writeActivityLog(supabase, {
      userId: user.id,
      organizationId: item.organization_id,
      action: 'update',
      module: 'news',
      description: `Updated news ${item.title}`,
      ipAddress: c.req.header('cf-connecting-ip') ?? null,
    });

    return c.json(success(item));
  },
);

newsRoute.delete('/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('authUser');
  const supabase = createSupabaseAdmin(c.env);
  const existing = await getNews(supabase, id);
  assertNewsScope(user, existing.organization_id);
  await deleteNews(supabase, id);
  await writeActivityLog(supabase, {
    userId: user.id,
    organizationId: existing.organization_id,
    action: 'delete',
    module: 'news',
    description: `Deleted news ${id}`,
    ipAddress: c.req.header('cf-connecting-ip') ?? null,
  });

  return c.json(success({ deleted: true }));
});
