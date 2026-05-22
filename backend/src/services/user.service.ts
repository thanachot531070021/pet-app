import type { SupabaseClient } from '@supabase/supabase-js';
import type { OrganizationAdminRole, UserRole } from '../types/user.type';
import { conflict, notFound } from '../utils/error';
import { rangeFromPagination } from '../utils/validation';

export type CreateAdminInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  role: Extract<UserRole, 'shop_admin' | 'clinic_admin'>;
  organizationId: string;
  organizationRole: OrganizationAdminRole;
};

export type UpdateAdminInput = {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string | null;
  role?: Extract<UserRole, 'shop_admin' | 'clinic_admin'>;
  avatarUrl?: string | null;
  organizationId?: string;
  organizationRole?: OrganizationAdminRole;
};

export async function listAdmins(
  supabase: SupabaseClient,
  params: { page: number; perPage: number; organizationId?: string },
) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  let query = supabase
    .from('organization_admins')
    .select(
      `
      id,
      role,
      created_at,
      organization_id,
      organizations:organization_id (
        id,
        name,
        type,
        status
      ),
      users:user_id (
        id,
        email,
        full_name,
        phone,
        role,
        avatar_url,
        created_at,
        updated_at
      )
    `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.organizationId) query = query.eq('organization_id', params.organizationId);

  const { data, error, count } = await query;
  if (error) throw error;

  return { items: data ?? [], count: count ?? 0 };
}

export async function createAdmin(supabase: SupabaseClient, input: CreateAdminInput) {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    phone: input.phone ?? undefined,
    user_metadata: {
      full_name: input.fullName,
      role: input.role,
    },
  });

  if (authError || !authData.user) {
    throw conflict(authError?.message ?? 'Unable to create admin user');
  }

  const userId = authData.user.id;
  const { error: profileError } = await supabase.from('users').insert({
    id: userId,
    email: input.email,
    full_name: input.fullName,
    phone: input.phone ?? null,
    role: input.role,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    throw profileError;
  }

  const { data: membership, error: membershipError } = await supabase
    .from('organization_admins')
    .insert({
      user_id: userId,
      organization_id: input.organizationId,
      role: input.organizationRole,
    })
    .select()
    .single();

  if (membershipError) {
    await supabase.auth.admin.deleteUser(userId);
    throw membershipError;
  }

  return { userId, membership };
}

export async function updateAdmin(supabase: SupabaseClient, userId: string, input: UpdateAdminInput) {
  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('id,email,full_name,phone,role,avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw notFound('Admin user not found');

  if (input.email || input.password || input.phone !== undefined || input.fullName || input.role) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email: input.email,
      password: input.password,
      phone: input.phone ?? undefined,
      user_metadata: {
        full_name: input.fullName ?? existing.full_name,
        role: input.role ?? existing.role,
      },
    });

    if (error) throw conflict(error.message);
  }

  const profilePatch = {
    email: input.email,
    full_name: input.fullName,
    phone: input.phone,
    role: input.role,
    avatar_url: input.avatarUrl,
  };

  const { data: user, error: profileError } = await supabase
    .from('users')
    .update(profilePatch)
    .eq('id', userId)
    .select()
    .single();

  if (profileError) throw profileError;

  if (input.organizationId || input.organizationRole) {
    const membershipPatch = {
      organization_id: input.organizationId,
      role: input.organizationRole,
    };

    const { error: membershipError } = await supabase
      .from('organization_admins')
      .update(membershipPatch)
      .eq('user_id', userId);

    if (membershipError) throw membershipError;
  }

  return user;
}

export async function deactivateAdmin(supabase: SupabaseClient, userId: string) {
  const { error: profileError } = await supabase
    .from('users')
    .update({ role: 'user' })
    .eq('id', userId);

  if (profileError) throw profileError;

  const { error: membershipError } = await supabase
    .from('organization_admins')
    .delete()
    .eq('user_id', userId);

  if (membershipError) throw membershipError;

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'user' },
  });

  if (authError) throw conflict(authError.message);
}
