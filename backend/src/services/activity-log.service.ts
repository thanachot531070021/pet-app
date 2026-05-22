import type { SupabaseClient } from '@supabase/supabase-js';
import { rangeFromPagination } from '../utils/validation';

type ActivityInput = {
  userId: string;
  organizationId?: string | null;
  action: string;
  module: string;
  description: string;
  ipAddress?: string | null;
};

export async function writeActivityLog(supabase: SupabaseClient, input: ActivityInput) {
  await supabase.from('activity_logs').insert({
    user_id: input.userId,
    organization_id: input.organizationId ?? null,
    action: input.action,
    module: input.module,
    description: input.description,
    ip_address: input.ipAddress ?? null,
  });
}

export async function listActivityLogs(supabase: SupabaseClient, params: { page: number; perPage: number }) {
  const [from, to] = rangeFromPagination(params.page, params.perPage);
  const { data, error, count } = await supabase
    .from('activity_logs')
    .select(
      `
      id,
      user_id,
      organization_id,
      action,
      module,
      description,
      ip_address,
      created_at,
      users:user_id (
        email,
        full_name
      ),
      organizations:organization_id (
        name,
        type
      )
    `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data ?? [], count: count ?? 0 };
}
