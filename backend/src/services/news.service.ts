import type { SupabaseClient } from '@supabase/supabase-js';
import { notFound } from '../utils/error';
import { rangeFromPagination } from '../utils/validation';

export type NewsInput = {
  organizationId?: string | null;
  title: string;
  content: string;
  coverImage?: string | null;
  type: 'global' | 'shop' | 'clinic' | 'promotion' | 'announcement';
  status?: 'draft' | 'published' | 'archived';
  publishedAt?: string | null;
  createdBy: string;
};

function toNewsRecord(input: Partial<NewsInput>) {
  return {
    organization_id: input.organizationId,
    title: input.title,
    content: input.content,
    cover_image: input.coverImage,
    type: input.type,
    status: input.status,
    published_at: input.publishedAt,
    created_by: input.createdBy,
  };
}

export async function listNews(
  supabase: SupabaseClient,
  params: {
    page: number;
    perPage: number;
    organizationIds?: string[];
    includeGlobal?: boolean;
    publishedOnly?: boolean;
    search?: string;
  },
) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  let query = supabase
    .from('news')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.publishedOnly) query = query.eq('status', 'published').not('published_at', 'is', null);
  if (params.organizationIds && params.organizationIds.length > 0) {
    const ids = params.organizationIds.map((id) => `"${id}"`).join(',');
    query = params.includeGlobal
      ? query.or(`organization_id.is.null,organization_id.in.(${ids})`)
      : query.in('organization_id', params.organizationIds);
  } else if (params.includeGlobal) {
    query = query.is('organization_id', null);
  }
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { items: data ?? [], count: count ?? 0 };
}

export async function getNews(supabase: SupabaseClient, id: string, publishedOnly = false) {
  let query = supabase.from('news').select('*').eq('id', id);
  if (publishedOnly) query = query.eq('status', 'published');

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('News not found');

  return data;
}

export async function createNews(supabase: SupabaseClient, input: NewsInput) {
  const { data, error } = await supabase.from('news').insert(toNewsRecord(input)).select().single();
  if (error) throw error;
  return data;
}

export async function updateNews(supabase: SupabaseClient, id: string, input: Partial<NewsInput>) {
  const { data, error } = await supabase
    .from('news')
    .update(toNewsRecord(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNews(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
}
