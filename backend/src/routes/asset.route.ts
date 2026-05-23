import { Hono } from 'hono';
import type { AppVariables } from '../types/app';
import type { Env } from '../types/env';
import { failure } from '../utils/response';

export const assetRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

assetRoute.get('/*', async (c) => {
  const key = c.req.path.replace(/^\/api\/assets\//, '');
  if (!key) {
    return c.json(failure('not_found', 'Asset not found'), 404);
  }

  const object = await c.env.ASSETS.get(key);
  if (!object) {
    return c.json(failure('not_found', 'Asset not found'), 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
});
