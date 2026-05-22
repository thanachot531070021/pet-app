import { createMiddleware } from 'hono/factory';
import { createSupabaseAdmin } from '../lib/supabase';
import type { AppVariables } from '../types/app';
import type { Env } from '../types/env';
import { getAuthUserFromToken } from '../services/auth.service';
import { unauthorized } from '../utils/error';

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: AppVariables }>(
  async (c, next) => {
    const header = c.req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

    if (!token) {
      throw unauthorized();
    }

    const supabase = createSupabaseAdmin(c.env);
    const authUser = await getAuthUserFromToken(supabase, token);
    c.set('authUser', authUser);

    await next();
  },
);
