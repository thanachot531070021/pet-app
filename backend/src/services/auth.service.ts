import type { SupabaseClient } from '@supabase/supabase-js';
import { conflict, unauthorized } from '../utils/error';
import type { AuthUser } from '../types/app';
import type { UserRole } from '../types/user.type';

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
};

export async function signInWithPassword(
  supabasePublic: SupabaseClient,
  email: string,
  password: string,
) {
  const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    throw unauthorized('Invalid email or password');
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    userId: data.user.id,
  };
}

export async function createMobileUser(
  supabaseAdmin: SupabaseClient,
  input: { email: string; password: string; fullName: string; phone?: string | null },
) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
      role: 'user',
    },
  });

  if (error || !data.user) {
    throw conflict(error?.message ?? 'Unable to create user');
  }

  const { error: profileError } = await supabaseAdmin.from('users').insert({
    id: data.user.id,
    email: input.email,
    full_name: input.fullName,
    phone: input.phone ?? null,
    role: 'user',
  });

  if (profileError) {
    throw conflict(profileError.message);
  }

  return data.user;
}

export async function getAuthUserFromToken(
  supabaseAdmin: SupabaseClient,
  token: string,
): Promise<AuthUser> {
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user) {
    throw unauthorized('Invalid or expired token');
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id,email,full_name,phone,role,avatar_url')
    .eq('id', authData.user.id)
    .single<UserRow>();

  if (userError || !user) {
    throw unauthorized('User profile not found');
  }

  const { data: memberships, error: membershipError } = await supabaseAdmin
    .from('organization_admins')
    .select('organization_id')
    .eq('user_id', user.id);

  if (membershipError) {
    throw conflict('Unable to load organization memberships');
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatar_url,
    organizationIds: (memberships ?? []).map((item) => item.organization_id as string),
  };
}

export async function syncUserProfile(supabaseAdmin: SupabaseClient, userId: string) {
  const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !authUser.user) {
    throw unauthorized('User not found in Supabase Auth');
  }

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin.from('users').insert({
      id: userId,
      email: authUser.user.email,
      full_name: authUser.user.user_metadata?.full_name ?? null,
      phone: authUser.user.phone ?? null,
      role: authUser.user.user_metadata?.role ?? 'user',
      avatar_url: authUser.user.user_metadata?.avatar_url ?? null,
    });
  }
}
