import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export interface ListAdminUsersParams {
  search?: string;
  role?: Database["public"]["Enums"]["user_role"];
  page?: number;
  limit?: number;
}

export async function listAdminUsers(
  admin: SupabaseClient<Database>,
  params: ListAdminUsersParams = {},
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  const { data, error } = await admin.rpc("admin_list_users", {
    p_search: params.search,
    p_role: params.role,
    p_limit: limit,
    p_offset: (page - 1) * limit,
  });

  if (error) {
    throw new Error(`admin_list_users failed: ${error.message}`);
  }

  const rows = data ?? [];
  const total = rows[0]?.total_count ?? 0;
  const items = rows.map((row) => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    created_at: row.created_at,
    free_menus_used: row.free_menus_used,
    credits_balance: row.credits_balance,
    menu_count: row.menu_count,
  }));

  return { items, page, limit, total };
}
