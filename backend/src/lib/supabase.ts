import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types/env';

export function getMissingSupabaseConfig(env: Env) {
  return (['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] as const).filter(
    (key) => !env[key],
  );
}

export function createSupabaseAdmin(env: Env) {
  const missing = getMissingSupabaseConfig(env);
  if (missing.length > 0) {
    throw new Error(`Missing Supabase Worker secrets: ${missing.join(', ')}`);
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createSupabasePublic(env: Env) {
  const missing = getMissingSupabaseConfig(env);
  if (missing.length > 0) {
    throw new Error(`Missing Supabase Worker secrets: ${missing.join(', ')}`);
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
