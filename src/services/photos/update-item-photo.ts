import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import { ApiError, NotFoundError } from "@/lib/errors";
import { menuContentSchema, type MenuContent } from "@/services/ai/schemas/menu-content";
import type { Database, Json } from "@/types/database.types";

/**
 * Shared by both photo endpoints (stock-pick and owner upload) — finds the
 * item by id across all categories and sets its `photoUrl` together with
 * its `photoSource`, validating the whole content shape again before
 * persisting so a malformed `menus.content` (e.g. from a pre-Stage-2 menu
 * that predates this schema) can't silently corrupt the save.
 *
 * `source` is required, not defaulted: it is what protects an owner's
 * uploaded photo from being replaced by the bulk stock refresh, and a
 * silent default would be exactly the way that protection gets lost when a
 * third write path is added later.
 */
export async function updateItemPhotoUrl(
  supabase: SupabaseClient<Database>,
  userId: string,
  menuId: string,
  itemId: string,
  photoUrl: string,
  source: "stock" | "upload",
): Promise<MenuContent> {
  const { data: menu, error: fetchError } = await supabase
    .from("menus")
    .select("content")
    .eq("id", menuId)
    .eq("user_id", userId)
    .maybeSingle();
  if (fetchError) {
    throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
  }
  if (!menu) {
    throw new NotFoundError("Меню не знайдено.");
  }

  const parsed = menuContentSchema.safeParse(menu.content);
  const content = parsed.success ? parsed.data : { categories: [] };

  let found = false;
  const updatedContent: MenuContent = {
    ...content,
    categories: content.categories.map((category) => ({
      ...category,
      items: category.items.map((item) => {
        if (item.id !== itemId) return item;
        found = true;
        return { ...item, photoUrl, photoSource: source };
      }),
    })),
  };

  if (!found) {
    throw new NotFoundError("Страву не знайдено.");
  }

  const { error: updateError } = await supabase
    .from("menus")
    .update({ content: updatedContent as unknown as Json })
    .eq("id", menuId)
    .eq("user_id", userId);
  if (updateError) {
    throw new ApiError(500, "db_error", "Не вдалося зберегти фото.");
  }

  return updatedContent;
}
