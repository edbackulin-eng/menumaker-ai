import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import { styleSuffix, toBusinessType } from "@/config/photo-style";
import { PHOTO_CONFIG } from "@/config/photos";
import { ApiError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { menuContentSchema, type MenuContent } from "@/services/ai/schemas/menu-content";
import { findDishPhotoCandidates } from "@/services/photos/find-dish-photo";
import { isStockPhoto } from "@/services/photos/photo-provenance";
import type { Database, Json } from "@/types/database.types";

export interface RefreshStockPhotosResult {
  content: MenuContent;
  /** Dishes whose photo was actually replaced. */
  replaced: number;
  /** Owner-uploaded photos deliberately left untouched. */
  skippedOwnUploads: number;
  /** Stock dishes the provider returned nothing for — their existing photo is kept. */
  unchanged: number;
}

/**
 * Re-runs the stock photo search for a menu with its current venue-type
 * motif, replacing only photos that came from the provider.
 *
 * The one inviolable rule: a photo the owner uploaded is never touched.
 * That is checked per item via isStockPhoto() rather than by any global
 * flag, so a single uploaded photo survives even when every other dish is
 * refreshed. Losing an owner's own photograph to an automated bulk action
 * is the worst outcome this feature could produce, so the check is the
 * first thing each iteration does.
 *
 * A dish whose search returns nothing (provider error, global quota spent,
 * genuinely no match) keeps whatever photo it already had — a refresh must
 * never leave a menu emptier than it found it.
 */
export async function refreshStockPhotos(
  supabase: SupabaseClient<Database>,
  userId: string,
  menuId: string,
): Promise<RefreshStockPhotosResult> {
  const { data: menu, error: fetchError } = await supabase
    .from("menus")
    .select("content, business_type")
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
  const suffix = PHOTO_CONFIG.styleSuffixEnabled
    ? styleSuffix(toBusinessType(menu.business_type))
    : undefined;

  let replaced = 0;
  let skippedOwnUploads = 0;
  let unchanged = 0;

  const categories = await Promise.all(
    content.categories.map(async (category) => ({
      ...category,
      items: await Promise.all(
        category.items.map(async (item) => {
          if (!isStockPhoto(item)) {
            skippedOwnUploads += 1;
            return item;
          }
          const candidates = await findDishPhotoCandidates({
            name: item.name,
            searchQuery: item.searchQuery,
            styleSuffix: suffix,
          });
          const next = candidates[0];
          if (!next) {
            unchanged += 1;
            return item;
          }
          replaced += 1;
          return { ...item, photoUrl: next.photoUrl, photoSource: "stock" as const };
        }),
      ),
    })),
  );

  const updatedContent: MenuContent = { ...content, categories };

  const { error: updateError } = await supabase
    .from("menus")
    .update({ content: updatedContent as unknown as Json })
    .eq("id", menuId)
    .eq("user_id", userId);
  if (updateError) {
    logger.error({ err: updateError, menuId }, "refresh_stock_photos_save_failed");
    throw new ApiError(500, "db_error", "Не вдалося зберегти оновлені фото.");
  }

  return { content: updatedContent, replaced, skippedOwnUploads, unchanged };
}
