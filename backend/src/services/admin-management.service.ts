import type { SupabaseClient } from '@supabase/supabase-js';
import { rangeFromPagination } from '../utils/validation';

export async function listOrganizationReviews(
  supabase: SupabaseClient,
  params: { organizationId: string; page: number; perPage: number },
) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  const { data, error, count } = await supabase
    .from('reviews')
    .select(
      `
      id,
      user_id,
      organization_id,
      rating,
      comment,
      status,
      created_at,
      updated_at,
      users:user_id (id,email,full_name)
    `,
      { count: 'exact' },
    )
    .eq('organization_id', params.organizationId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data ?? [], count: count ?? 0 };
}

export async function updateReviewStatus(
  supabase: SupabaseClient,
  params: { id: string; organizationId: string; status: 'pending' | 'published' | 'hidden' },
) {
  const { data, error } = await supabase
    .from('reviews')
    .update({ status: params.status })
    .eq('id', params.id)
    .eq('organization_id', params.organizationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listOrganizationBookings(
  supabase: SupabaseClient,
  params: { organizationId: string; page: number; perPage: number },
) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  const { data, error, count } = await supabase
    .from('bookings')
    .select(
      `
      id,
      user_id,
      organization_id,
      service_id,
      scheduled_at,
      status,
      note,
      created_at,
      updated_at,
      users:user_id (id,email,full_name,phone),
      services:service_id (id,name,price,duration_minutes)
    `,
      { count: 'exact' },
    )
    .eq('organization_id', params.organizationId)
    .order('scheduled_at', { ascending: true })
    .range(from, to);

  if (error) throw error;
  return { items: data ?? [], count: count ?? 0 };
}

export async function updateBookingStatus(
  supabase: SupabaseClient,
  params: { id: string; organizationId: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' },
) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: params.status })
    .eq('id', params.id)
    .eq('organization_id', params.organizationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
