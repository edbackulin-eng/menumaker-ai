import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { styleSuffix, toBusinessType } from "@/config/photo-style";
import { PHOTO_CONFIG } from "@/config/photos";
import { ApiError, NotFoundError } from "@/lib/errors";
import { menuItemParamsSchema } from "@/lib/validations/menu-photo";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";
import { findDishPhotoCandidates } from "@/services/photos/find-dish-photo";

interface RouteContext {
  params: Promise<{ id: string; itemId: string }>;
}

/**
 * Explicit, user-triggered photo search for one dish — not automatic on
 * page load. Keeps the global Pexels quota (200 req/hour, shared by every
 * user) spent only on dishes someone actually asked to see a photo for,
 * per the Stage 2 plan's answer to "when are photos searched."
 *
 * Read-only: returns candidates for the picker grid, writes nothing to
 * `menus.content`. Persisting only happens when the user actually picks
 * one (POST .../photo/select) — opening the grid must never itself count
 * as "the user chose this photo."
 */
export const POST = withApiHandler<RouteContext>(
  async (_request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id, itemId } = validateParams(await params, menuItemParamsSchema);

    const { data: menu, error } = await supabase
      .from("menus")
      .select("content, business_type")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
    }
    if (!menu) {
      throw new NotFoundError("Меню не знайдено.");
    }

    const parsed = menuContentSchema.safeParse(menu.content);
    const content = parsed.success ? parsed.data : { categories: [] };
    const item = content.categories
      .flatMap((category) => category.items)
      .find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundError("Страву не знайдено.");
    }

    // The menu's real venue type, picked on the Template step. `null` here
    // (the user hasn't got that far yet) means a plain search with no motif
    // suffix — see styleSuffix's doc comment.
    const candidates = await findDishPhotoCandidates({
      name: item.name,
      searchQuery: item.searchQuery,
      styleSuffix: PHOTO_CONFIG.styleSuffixEnabled
        ? styleSuffix(toBusinessType(menu.business_type))
        : undefined,
    });

    return apiSuccess({ candidates });
  },
  { rateLimitTier: "authenticated" },
);
