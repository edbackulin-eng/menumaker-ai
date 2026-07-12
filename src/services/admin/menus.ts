import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export interface ListAdminMenusParams {
  status?: Database["public"]["Enums"]["menu_status"];
  page?: number;
  limit?: number;
}

export async function listAdminMenus(
  admin: SupabaseClient<Database>,
  params: ListAdminMenusParams = {},
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  const { data, error } = await admin.rpc("admin_list_menus", {
    p_status: params.status,
    p_limit: limit,
    p_offset: (page - 1) * limit,
  });

  if (error) {
    throw new Error(`admin_list_menus failed: ${error.message}`);
  }

  const rows = data ?? [];
  const total = rows[0]?.total_count ?? 0;
  const items = rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    owner_email: row.owner_email,
    template_id: row.template_id,
    template_name: row.template_name,
    created_at: row.created_at,
  }));

  return { items, page, limit, total };
}

/**
 * Metadata-only detail for support purposes — explicit column list that
 * excludes `content`/`style_overrides`, see the API route's own comment for
 * why. Uses the caller's RLS-scoped client (menus is admin-readable via
 * policy), not service-role, since this is a plain permitted read.
 */
export async function getAdminMenuDetail(supabase: SupabaseClient<Database>, id: string) {
  const { data: menu, error } = await supabase
    .from("menus")
    .select(
      "id, title, status, source_type, template_id, locale, is_public, public_slug, created_at, updated_at, content_confirmed_at, user_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`menus select failed: ${error.message}`);
  }
  if (!menu) {
    return null;
  }

  const [{ data: owner }, { data: template }] = await Promise.all([
    supabase.from("profiles").select("email, full_name").eq("id", menu.user_id).maybeSingle(),
    menu.template_id
      ? supabase.from("menu_templates").select("name").eq("id", menu.template_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    ...menu,
    owner_email: owner?.email ?? null,
    owner_full_name: owner?.full_name ?? null,
    template_name: template?.name ?? null,
  };
}
