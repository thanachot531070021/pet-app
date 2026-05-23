import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import type { AppVariables } from './types/app';
import type { Env } from './types/env';
import { authRoute } from './routes/auth.route';
import { superAdminRoute } from './routes/super-admin.route';
import { adminRoute } from './routes/admin.route';
import { newsRoute } from './routes/news.route';
import { mobileRoute } from './routes/mobile.route';
import { uploadRoute } from './routes/upload.route';
import { assetRoute } from './routes/asset.route';
import { createSupabaseAdmin, getMissingSupabaseConfig } from './lib/supabase';
import { failure, success } from './utils/response';

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>().basePath('/api');

const defaultCorsOrigins = [
  'https://pet-app-admin.pages.dev',
  'http://localhost:5173',
  'http://localhost:4173',
];

function allowedCorsOrigin(origin: string, env: Env) {
  const allowed = (env.CORS_ORIGINS ?? defaultCorsOrigins.join(','))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return allowed.includes(origin) ? origin : null;
}

app.use(
  '*',
  cors({
    origin: (origin, c) => allowedCorsOrigin(origin, c.env),
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);

app.get('/health', (c) =>
  c.json(
    success({
      status: 'ok',
      service: 'pet-app-api',
      environment: c.env.APP_ENV ?? 'unknown',
    }),
  ),
);

app.get('/health/db', async (c) => {
  const missingConfig = getMissingSupabaseConfig(c.env);
  if (missingConfig.length > 0) {
    return c.json(
      failure('missing_config', `Missing Worker secrets: ${missingConfig.join(', ')}`),
      503,
    );
  }

  const supabase = createSupabaseAdmin(c.env);
  const { error } = await supabase.from('organizations').select('id', { count: 'exact', head: true });

  if (error) {
    return c.json(failure('database_unavailable', error.message), 503);
  }

  return c.json(success({ status: 'ok' }));
});

app.route('/auth', authRoute);
app.route('/super-admin', superAdminRoute);
app.route('/admin', adminRoute);
app.route('/news', newsRoute);
app.route('/mobile', mobileRoute);
app.route('/uploads', uploadRoute);
app.route('/assets', assetRoute);

app.notFound((c) => c.json(failure('not_found', 'Route not found'), 404));

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json(
      failure(error.status >= 500 ? 'internal_error' : 'request_error', error.message),
      error.status,
    );
  }

  console.error(error);
  return c.json(failure('internal_error', 'Unexpected server error'), 500);
});

export default app;
