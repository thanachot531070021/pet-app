import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppVariables } from '../types/app';
import type { Env } from '../types/env';
import { createSupabaseAdmin } from '../lib/supabase';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';
import { success } from '../utils/response';

export const uploadRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

uploadRoute.use('*', authMiddleware, requireRoles('super_admin', 'shop_admin', 'clinic_admin'));

const uploadBodySchema = z.object({
  folder: z.enum(['organizations', 'banners', 'news', 'services']),
  fileName: z.string().min(1).max(160),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

uploadRoute.post('/signed-url', zValidator('json', uploadBodySchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('authUser');
  const supabase = createSupabaseAdmin(c.env);
  const ownerSegment = user.role === 'super_admin' ? 'system' : user.organizationIds[0] ?? user.id;
  const path = `${body.folder}/${ownerSegment}/${crypto.randomUUID()}-${sanitizeFileName(body.fileName)}`;

  const { data, error } = await supabase.storage
    .from('public-assets')
    .createSignedUploadUrl(path, { upsert: true });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage.from('public-assets').getPublicUrl(path);

  return c.json(
    success({
      bucket: 'public-assets',
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: publicUrl.publicUrl,
      contentType: body.contentType,
    }),
    201,
  );
});
