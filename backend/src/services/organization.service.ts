import type { SupabaseClient } from '@supabase/supabase-js';
import { notFound } from '../utils/error';
import type { OrganizationStatus, OrganizationType } from '../types/organization.type';
import { rangeFromPagination } from '../utils/validation';

export type OrganizationInput = {
  name: string;
  type: OrganizationType;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: OrganizationStatus;
};

function toOrganizationRecord(input: Partial<OrganizationInput>) {
  return {
    name: input.name,
    type: input.type,
    description: input.description,
    logo_url: input.logoUrl,
    cover_url: input.coverUrl,
    phone: input.phone,
    email: input.email,
    address: input.address,
    province: input.province,
    district: input.district,
    subdistrict: input.subdistrict,
    latitude: input.latitude,
    longitude: input.longitude,
    status: input.status,
  };
}

export async function listOrganizations(
  supabase: SupabaseClient,
  params: {
    page: number;
    perPage: number;
    type?: OrganizationType;
    status?: OrganizationStatus;
    onlyActive?: boolean;
    search?: string;
  },
) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  let query = supabase
    .from('organizations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.type) query = query.eq('type', params.type);
  if (params.status) query = query.eq('status', params.status);
  if (params.onlyActive) query = query.eq('status', 'active');
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,province.ilike.%${params.search}%,district.ilike.%${params.search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { items: data ?? [], count: count ?? 0 };
}

export async function getOrganization(supabase: SupabaseClient, id: string, onlyActive = false) {
  let query = supabase.from('organizations').select('*').eq('id', id);
  if (onlyActive) query = query.eq('status', 'active');

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('Organization not found');

  return data;
}

export async function createOrganization(supabase: SupabaseClient, input: OrganizationInput) {
  const { data, error } = await supabase
    .from('organizations')
    .insert(toOrganizationRecord(input))
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrganization(
  supabase: SupabaseClient,
  id: string,
  input: Partial<OrganizationInput>,
) {
  const { data, error } = await supabase
    .from('organizations')
    .update(toOrganizationRecord(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOrganization(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  if (error) throw error;
}

export async function attachOrganizationAdmin(
  supabase: SupabaseClient,
  input: {
    userId: string;
    organizationId: string;
    role: string;
  },
) {
  const { data, error } = await supabase
    .from('organization_admins')
    .insert({
      user_id: input.userId,
      organization_id: input.organizationId,
      role: input.role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
