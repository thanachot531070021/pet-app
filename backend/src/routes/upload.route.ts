import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppVariables } from '../types/app';
import type { Env } from '../types/env';
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

function publicAssetUrl(requestUrl: string, path: string) {
  const url = new URL(requestUrl);
  return `${url.origin}/api/assets/${path}`;
}

function assertImageFile(value: FormDataEntryValue | null): File {
  if (!(value instanceof File)) {
    throw new Error('Image file is required');
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(value.type)) {
    throw new Error('Use a JPEG, PNG, or WebP image');
  }

  return value;
}

uploadRoute.post('/signed-url', zValidator('json', uploadBodySchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('authUser');
  const ownerSegment = user.role === 'super_admin' ? 'system' : user.organizationIds[0] ?? user.id;
  const path = `${body.folder}/${ownerSegment}/${crypto.randomUUID()}-${sanitizeFileName(body.fileName)}`;

  return c.json(
    success({
      bucket: 'pet-app-assets',
      path,
      token: null,
      signedUrl: null,
      publicUrl: publicAssetUrl(c.req.url, path),
      contentType: body.contentType,
    }),
    201,
  );
});

uploadRoute.post('/direct', async (c) => {
  const user = c.get('authUser');
  const formData = await c.req.formData();
  const folder = z.enum(['organizations', 'banners', 'news', 'services']).parse(formData.get('folder'));
  const file = assertImageFile(formData.get('file'));
  const ownerSegment = user.role === 'super_admin' ? 'system' : user.organizationIds[0] ?? user.id;
  const path = `${folder}/${ownerSegment}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

  await c.env.ASSETS.put(path, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      uploadedBy: user.id,
      folder,
    },
  });

  return c.json(
    success({
      bucket: 'pet-app-assets',
      path,
      publicUrl: publicAssetUrl(c.req.url, path),
      contentType: file.type,
      size: file.size,
    }),
    201,
  );
});
