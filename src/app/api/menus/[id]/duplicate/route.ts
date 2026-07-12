import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError, NotFoundError } from "@/lib/errors";
import { menuIdParamSchema } from "@/lib/validations/menu";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Pure copy of an existing (completed) menu's content/style — no AI call
 * anywhere in this path, so it never touches credits. Only allowed for
 * `status = 'completed'` menus: duplicating a still-processing/failed/
 * unconfirmed draft wouldn't have anything meaningful worth copying yet.
 */
export const POST = withApiHandler<RouteContext>(
  async (_request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);

    const { data: original, error: fetchError } = await supabase
      .from("menus")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (fetchError) {
      throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
    }
    if (!original) {
      throw new NotFoundError("Меню не знайдено.");
    }
    if (original.status !== "completed") {
      throw new ApiError(422, "menu_not_completed", "Дублювати можна лише завершене меню.");
    }

    const { data: duplicate, error: insertError } = await supabase
      .from("menus")
      .insert({
        user_id: user.id,
        title: `${original.title} (копія)`,
        template_id: original.template_id,
        status: "draft",
        source_type: original.source_type,
        content: original.content,
        style_overrides: original.style_overrides,
        locale: original.locale,
        content_confirmed_at: new Date().toISOString(),
        // Never inherit publish state — the copy is a private starting point, not an instant re-publish.
        is_public: false,
      })
      .select()
      .single();
    if (insertError || !duplicate) {
      throw new ApiError(500, "db_error", "Не вдалося дублювати меню.");
    }

    return apiSuccess(duplicate, 201);
  },
  { rateLimitTier: "authenticated" },
);
