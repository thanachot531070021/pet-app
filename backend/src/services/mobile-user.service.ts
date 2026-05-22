import type { SupabaseClient } from '@supabase/supabase-js';
import { rangeFromPagination } from '../utils/validation';

export async function listFavorites(
  supabase: SupabaseClient,
  params: { userId: string; page: number; perPage: number },
) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  const { data, error, count } = await supabase
    .from('favorites')
    .select(
      `
      id,
      created_at,
      organizations:organization_id (
        id,
        name,
        type,
        description,
        logo_url,
        cover_url,
        phone,
        email,
        address,
        province,
        district,
        subdistrict,
        latitude,
        longitude,
        status,
        created_at,
        updated_at
      )
    `,
      { count: 'exact' },
    )
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data ?? [], count: count ?? 0 };
}

export async function addFavorite(
  supabase: SupabaseClient,
  params: { userId: string; organizationId: string },
) {
  const { data, error } = await supabase
    .from('favorites')
    .upsert(
      { user_id: params.userId, organization_id: params.organizationId },
      { onConflict: 'user_id,organization_id' },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFavorite(
  supabase: SupabaseClient,
  params: { userId: string; organizationId: string },
) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', params.userId)
    .eq('organization_id', params.organizationId);

  if (error) throw error;
}

export async function createReview(
  supabase: SupabaseClient,
  params: { userId: string; organizationId: string; rating: number; comment?: string | null },
) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: params.userId,
      organization_id: params.organizationId,
      rating: params.rating,
      comment: params.comment ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listBookings(
  supabase: SupabaseClient,
  params: { userId: string; page: number; perPage: number },
) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  const { data, error, count } = await supabase
    .from('bookings')
    .select(
      `
      id,
      organization_id,
      service_id,
      scheduled_at,
      status,
      note,
      created_at,
      organizations:organization_id (id,name,type),
      services:service_id (id,name,price,duration_minutes)
    `,
      { count: 'exact' },
    )
    .eq('user_id', params.userId)
    .order('scheduled_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data ?? [], count: count ?? 0 };
}

export async function createBooking(
  supabase: SupabaseClient,
  params: {
    userId: string;
    organizationId: string;
    serviceId?: string | null;
    scheduledAt: string;
    note?: string | null;
  },
) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: params.userId,
      organization_id: params.organizationId,
      service_id: params.serviceId ?? null,
      scheduled_at: params.scheduledAt,
      note: params.note ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
