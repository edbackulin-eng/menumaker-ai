import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody, validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError, NotFoundError } from "@/lib/errors";
import { confirmMenuSchema } from "@/lib/validations/menu-import";
import { menuIdParamSchema } from "@/lib/validations/menu";
import type { Json } from "@/types/database.types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Step 2 -> 3 (Review confirmed). Unlike the general PATCH /api/menus/[id]
 * (Stage 5, which accepts `content` as a loose Record<string, unknown>),
 * this validates strictly against menuContentSchema — the Review step lets
 * users hand-edit categories/items/prices, and a malformed edit here would
 * otherwise silently corrupt `menus.content` for the rest of the wizard.
 */
export const POST = withApiHandler<RouteContext>(
  async (request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);
    const { content } = await validateBody(request, confirmMenuSchema);

    const { data, error } = await supabase
      .from("menus")
      .update({
        content: content as unknown as Json,
        content_confirmed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося підтвердити меню.");
    }
    if (!data) {
      throw new NotFoundError("Меню не знайдено.");
    }

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);
