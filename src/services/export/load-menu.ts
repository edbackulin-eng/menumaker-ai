import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import { ApiError, NotFoundError } from "@/lib/errors";
import { applyStyleOrder } from "@/lib/utils/menu-content-order";
import {
  resolveEffectiveStyle,
  resolveTemplateDefaults,
  type ResolvedMenuStyle,
} from "@/lib/utils/resolve-menu-style";
import { styleOverridesSchema } from "@/lib/validations/menu-style";
import { menuContentSchema, type MenuContent } from "@/services/ai/schemas/menu-content";
import type { Database } from "@/types/database.types";

export interface ExportableMenu {
  id: string;
  title: string;
  publicSlug: string | null;
  isPublic: boolean;
  content: MenuContent;
  style: ResolvedMenuStyle;
}

/**
 * Shared load+validate+resolve step for all three export routes
 * (PDF/PNG/QR) — every one of them needs the exact same "does this menu
 * exist, is it mine, is it actually finished, what does it look like"
 * before doing anything renderer-specific. Throws ApiError directly
 * (rather than returning a discriminated result) because every caller here
 * is a Route Handler under withApiHandler, which already knows how to turn
 * a thrown ApiError into the right response — unlike, say,
 * getAdminMenuDetail (services/admin/menus.ts), which is also called from
 * an SSR page that wants to handle "not found" its own way.
 */
export async function loadExportableMenu(
  supabase: SupabaseClient<Database>,
  userId: string,
  menuId: string,
): Promise<ExportableMenu> {
  const { data: menu, error } = await supabase
    .from("menus")
    .select("id, title, content, style_overrides, status, template_id, is_public, public_slug")
    .eq("id", menuId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
  }
  if (!menu) {
    throw new NotFoundError("Меню не знайдено.");
  }
  if (menu.status !== "completed") {
    throw new ApiError(422, "menu_not_completed", "Експорт доступний лише для завершеного меню.");
  }

  const { data: template } = menu.template_id
    ? await supabase
        .from("menu_templates")
        .select("config, engine")
        .eq("id", menu.template_id)
        .maybeSingle()
    : { data: null };

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const content = parsedContent.success ? parsedContent.data : { categories: [] };

  const parsedStyleOverrides = styleOverridesSchema.safeParse(menu.style_overrides ?? {});
  const styleOverrides = parsedStyleOverrides.success ? parsedStyleOverrides.data : {};

  const templateDefaults = resolveTemplateDefaults(
    template?.config as Record<string, unknown> | null,
    template?.engine,
  );
  const style = resolveEffectiveStyle(templateDefaults, styleOverrides);
  const orderedContent = applyStyleOrder(content, styleOverrides);

  return {
    id: menu.id,
    title: menu.title,
    publicSlug: menu.public_slug,
    isPublic: menu.is_public,
    content: orderedContent,
    style,
  };
}
