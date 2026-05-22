import type { SupabaseClient } from '@supabase/supabase-js';
import { rangeFromPagination } from '../utils/validation';

export type ServiceInput = {
  organizationId: string;
  name: string;
  description?: string | null;
  price?: number | null;
  durationMinutes?: number | null;
  imageUrl?: string | null;
  status?: 'draft' | 'published' | 'archived';
};

function toServiceRecord(input: Partial<ServiceInput>) {
  return {
    organization_id: input.organizationId,
    name: input.name,
    description: input.description,
    price: input.price,
    duration_minutes: input.durationMinutes,
    image_url: input.imageUrl,
    status: input.status,
  };
}

export async function listServices(
  supabase: SupabaseClient,
  params: { page: number; perPage: number; organizationId: string },
) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  const { data, error, count } = await supabase
    .from('services')
    .select('*', { count: 'exact' })
    .eq('organization_id', params.organizationId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data ?? [], count: count ?? 0 };
}

export async function createService(supabase: SupabaseClient, input: ServiceInput) {
  const { data, error } = await supabase
    .from('services')
    .insert(toServiceRecord(input))
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteService(supabase: SupabaseClient, id: string, organizationId: string) {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) throw error;
}
