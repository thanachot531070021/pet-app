import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { AppVariables } from '../types/app';
import { createSupabaseAdmin } from '../lib/supabase';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getOrganization, listOrganizations } from '../services/organization.service';
import { getNews, listNews } from '../services/news.service';
import {
  addFavorite,
  createBooking,
  createReview,
  listBookings,
  listFavorites,
  removeFavorite,
} from '../services/mobile-user.service';
import { success } from '../utils/response';
import { paginationSchema, uuidSchema } from '../utils/validation';

export const mobileRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const mobileListQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
});

mobileRoute.get('/home', async (c) => {
  const supabase = createSupabaseAdmin(c.env);
  const [banners, shops, clinics, news] = await Promise.all([
    supabase
      .from('banners')
      .select('*')
      .eq('status', 'active')
      .order('position', { ascending: true })
      .limit(10),
    listOrganizations(supabase, { page: 1, perPage: 6, type: 'shop', onlyActive: true }),
    listOrganizations(supabase, { page: 1, perPage: 6, type: 'clinic', onlyActive: true }),
    listNews(supabase, { page: 1, perPage: 6, includeGlobal: true, publishedOnly: true }),
  ]);

  return c.json(
    success({
      banners: banners.data ?? [],
      shops: shops.items,
      clinics: clinics.items,
      news: news.items,
    }),
  );
});

mobileRoute.get('/shops', zValidator('query', mobileListQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listOrganizations(supabase, {
    ...query,
    type: 'shop',
    onlyActive: true,
  });

  return c.json(success(result));
});

mobileRoute.get('/shops/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid('param');
  const supabase = createSupabaseAdmin(c.env);
  const [organization, services, reviews] = await Promise.all([
    getOrganization(supabase, id, true),
    supabase
      .from('services')
      .select('*')
      .eq('organization_id', id)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('rating', { count: 'exact' })
      .eq('organization_id', id)
      .eq('status', 'published'),
  ]);

  return c.json(
    success({
      organization,
      services: services.data ?? [],
      reviewCount: reviews.count ?? 0,
    }),
  );
});

mobileRoute.get('/clinics', zValidator('query', mobileListQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listOrganizations(supabase, {
    ...query,
    type: 'clinic',
    onlyActive: true,
  });

  return c.json(success(result));
});

mobileRoute.get('/clinics/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid('param');
  const supabase = createSupabaseAdmin(c.env);
  const [organization, services, reviews] = await Promise.all([
    getOrganization(supabase, id, true),
    supabase
      .from('services')
      .select('*')
      .eq('organization_id', id)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('rating', { count: 'exact' })
      .eq('organization_id', id)
      .eq('status', 'published'),
  ]);

  return c.json(
    success({
      organization,
      services: services.data ?? [],
      reviewCount: reviews.count ?? 0,
    }),
  );
});

mobileRoute.get('/news', zValidator('query', mobileListQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listNews(supabase, {
    ...query,
    includeGlobal: true,
    publishedOnly: true,
  });

  return c.json(success(result));
});

mobileRoute.get('/news/:id', zValidator('param', z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid('param');
  const supabase = createSupabaseAdmin(c.env);
  const item = await getNews(supabase, id, true);

  return c.json(success(item));
});

mobileRoute.use('/me/*', authMiddleware);

mobileRoute.get('/me/favorites', zValidator('query', paginationSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('authUser');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listFavorites(supabase, { ...query, userId: user.id });

  return c.json(success(result));
});

mobileRoute.post(
  '/me/favorites',
  zValidator('json', z.object({ organizationId: uuidSchema })),
  async (c) => {
    const user = c.get('authUser');
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const favorite = await addFavorite(supabase, { userId: user.id, organizationId: body.organizationId });

    return c.json(success(favorite), 201);
  },
);

mobileRoute.delete(
  '/me/favorites/:organizationId',
  zValidator('param', z.object({ organizationId: uuidSchema })),
  async (c) => {
    const user = c.get('authUser');
    const { organizationId } = c.req.valid('param');
    const supabase = createSupabaseAdmin(c.env);
    await removeFavorite(supabase, { userId: user.id, organizationId });

    return c.json(success({ deleted: true }));
  },
);

mobileRoute.post(
  '/me/reviews',
  zValidator(
    'json',
    z.object({
      organizationId: uuidSchema,
      rating: z.number().int().min(1).max(5),
      comment: z.string().nullish(),
    }),
  ),
  async (c) => {
    const user = c.get('authUser');
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const review = await createReview(supabase, {
      userId: user.id,
      organizationId: body.organizationId,
      rating: body.rating,
      comment: body.comment,
    });

    return c.json(success(review), 201);
  },
);

mobileRoute.get('/me/bookings', zValidator('query', paginationSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('authUser');
  const supabase = createSupabaseAdmin(c.env);
  const result = await listBookings(supabase, { ...query, userId: user.id });

  return c.json(success(result));
});

mobileRoute.post(
  '/me/bookings',
  zValidator(
    'json',
    z.object({
      organizationId: uuidSchema,
      serviceId: uuidSchema.nullish(),
      scheduledAt: z.string().datetime(),
      note: z.string().nullish(),
    }),
  ),
  async (c) => {
    const user = c.get('authUser');
    const body = c.req.valid('json');
    const supabase = createSupabaseAdmin(c.env);
    const booking = await createBooking(supabase, {
      userId: user.id,
      organizationId: body.organizationId,
      serviceId: body.serviceId,
      scheduledAt: body.scheduledAt,
      note: body.note,
    });

    return c.json(success(booking), 201);
  },
);
