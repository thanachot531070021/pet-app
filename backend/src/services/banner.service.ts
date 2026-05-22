import type { SupabaseClient } from '@supabase/supabase-js';
import { notFound } from '../utils/error';
import { rangeFromPagination } from '../utils/validation';

export type BannerInput = {
  title: string;
  imageUrl: string;
  linkType?: string | null;
  linkValue?: string | null;
  position?: number;
  status?: 'active' | 'inactive';
  startDate?: string | null;
  endDate?: string | null;
};

function toBannerRecord(input: Partial<BannerInput>) {
  return {
    title: input.title,
    image_url: input.imageUrl,
    link_type: input.linkType,
    link_value: input.linkValue,
    position: input.position,
    status: input.status,
    start_date: input.startDate,
    end_date: input.endDate,
  };
}

export async function listBanners(supabase: SupabaseClient, params: { page: number; perPage: number }) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  const { data, error, count } = await supabase
    .from('banners')
    .select('*', { count: 'exact' })
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data ?? [], count: count ?? 0 };
}

export async function createBanner(supabase: SupabaseClient, input: BannerInput) {
  const { data, error } = await supabase
    .from('banners')
    .insert(toBannerRecord(input))
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBanner(supabase: SupabaseClient, id: string, input: Partial<BannerInput>) {
  const { data, error } = await supabase
    .from('banners')
    .update(toBannerRecord(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw notFound('Banner not found');
  return data;
}

export async function deleteBanner(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}
