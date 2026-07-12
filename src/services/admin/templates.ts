import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { UpdateTemplateInput } from "@/lib/validations/admin";

const TEMPLATE_COLUMNS =
  "id, slug, name, category, is_active, sort_order, preview_image_url, created_at";

/** RLS-permitted read via the caller's own session — menu_templates is readable by any authenticated user. */
export async function listAdminTemplates(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("menu_templates")
    .select(TEMPLATE_COLUMNS)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`menu_templates select failed: ${error.message}`);
  }
  return data ?? [];
}

/**
 * `menu_templates_write_admin_only` RLS (Stage 2) already gates this at the
 * database level for the caller's own session — no service-role bypass or
 * dedicated SQL function needed, unlike role-change/credit-grant which
 * write to tables with no admin RLS exception at all.
 */
export async function updateAdminTemplate(
  supabase: SupabaseClient<Database>,
  id: string,
  input: UpdateTemplateInput,
) {
  const updatePayload: Database["public"]["Tables"]["menu_templates"]["Update"] = {};
  if (input.is_active !== undefined) updatePayload.is_active = input.is_active;
  if (input.sort_order !== undefined) updatePayload.sort_order = input.sort_order;

  if (input.name) {
    const { data: existing } = await supabase
      .from("menu_templates")
      .select("name")
      .eq("id", id)
      .maybeSingle();
    if (!existing) {
      return null;
    }
    const currentName =
      existing.name && typeof existing.name === "object" && !Array.isArray(existing.name)
        ? (existing.name as Record<string, string>)
        : {};
    updatePayload.name = { ...currentName, ...input.name };
  }

  const { data, error } = await supabase
    .from("menu_templates")
    .update(updatePayload)
    .eq("id", id)
    .select(TEMPLATE_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(`menu_templates update failed: ${error.message}`);
  }
  return data;
}
