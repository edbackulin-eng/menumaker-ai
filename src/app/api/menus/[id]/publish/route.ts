import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody, validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError, NotFoundError } from "@/lib/errors";
import { menuIdParamSchema } from "@/lib/validations/menu";
import { publishRequestSchema } from "@/lib/validations/publish";
import { generateSlugSuggestion } from "@/lib/utils/slug";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UNIQUE_VIOLATION = "23505";
const MAX_AUTO_SLUG_ATTEMPTS = 3;

/**
 * One endpoint for both publish and unpublish (`is_public: true|false` in
 * the body) rather than two — unpublishing is publishing's necessary
 * complement (a user who can make a menu public must be able to take it
 * back down), and the two share the same auth/ownership/validation setup
 * closely enough that splitting them would just duplicate that setup.
 * Unpublishing keeps `public_slug` as-is rather than clearing it, so
 * re-publishing later reuses the same URL — a QR code already printed and
 * taped to a table shouldn't go stale just because the menu was
 * temporarily taken down.
 */
export const PATCH = withApiHandler<RouteContext>(
  async (request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);
    const input = await validateBody(request, publishRequestSchema);

    const { data: menu, error: fetchError } = await supabase
      .from("menus")
      .select("id, title, status, public_slug")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (fetchError) {
      throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
    }
    if (!menu) {
      throw new NotFoundError("Меню не знайдено.");
    }

    if (!input.is_public) {
      const { data, error } = await supabase
        .from("menus")
        .update({ is_public: false })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        throw new ApiError(500, "db_error", "Не вдалося зняти меню з публікації.");
      }
      return apiSuccess(data);
    }

    if (menu.status !== "completed") {
      throw new ApiError(422, "menu_not_completed", "Публікувати можна лише завершене меню.");
    }

    if (input.slug) {
      const { data, error } = await supabase
        .from("menus")
        .update({ is_public: true, public_slug: input.slug })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        if (error.code === UNIQUE_VIOLATION) {
          throw new ApiError(
            409,
            "slug_taken",
            "Це посилання вже використовується, спробуйте інше.",
          );
        }
        throw new ApiError(500, "db_error", "Не вдалося опублікувати меню.");
      }
      return apiSuccess(data);
    }

    // No slug given: if this menu already has one (e.g. re-publishing after
    // an unpublish), reuse it rather than minting a new one — a QR code
    // already printed and taped to a table shouldn't go stale just because
    // the menu was temporarily taken down and republished without the
    // caller re-specifying the slug it already had.
    if (menu.public_slug) {
      const { data, error } = await supabase
        .from("menus")
        .update({ is_public: true })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        throw new ApiError(500, "db_error", "Не вдалося опублікувати меню.");
      }
      return apiSuccess(data);
    }

    // Genuinely first-time publish with no slug given: auto-generate from
    // the title. A collision here is the user's problem in name only (they
    // never typed anything) — retry with a fresh random suffix a few times
    // before giving up, rather than surfacing a "slug taken" error about a
    // slug they never chose.
    for (let attempt = 0; attempt < MAX_AUTO_SLUG_ATTEMPTS; attempt++) {
      const slug = generateSlugSuggestion(menu.title);
      const { data, error } = await supabase
        .from("menus")
        .update({ is_public: true, public_slug: slug })
        .eq("id", id)
        .select()
        .single();
      if (!error) {
        return apiSuccess(data);
      }
      if (error.code !== UNIQUE_VIOLATION) {
        throw new ApiError(500, "db_error", "Не вдалося опублікувати меню.");
      }
    }
    throw new ApiError(
      500,
      "slug_generation_failed",
      "Не вдалося згенерувати унікальне посилання. Спробуйте вказати власне.",
    );
  },
  { rateLimitTier: "authenticated" },
);
