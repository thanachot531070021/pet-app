import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { AppVariables } from '../types/app';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createSupabasePublic } from '../lib/supabase';
import { signInWithPassword } from '../services/auth.service';
import { success } from '../utils/response';

export const authRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

authRoute.post(
  '/login',
  zValidator(
    'json',
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
  ),
  async (c) => {
    const body = c.req.valid('json');
    const supabase = createSupabasePublic(c.env);
    const session = await signInWithPassword(supabase, body.email, body.password);

    return c.json(success(session));
  },
);

authRoute.post('/logout', authMiddleware, async (c) => {
  return c.json(success({ loggedOut: true }));
});

authRoute.get('/me', authMiddleware, async (c) => {
  return c.json(success(c.get('authUser')));
});
