import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody, validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError, NotFoundError } from "@/lib/errors";
import { applyTemplateSchema } from "@/lib/validations/menu-import";
import { menuIdParamSchema } from "@/lib/validations/menu";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Step 3 -> 4 (Template chosen). The final wizard step: sets `template_id` and flips `status` to 'completed'. */
export const POST = withApiHandler<RouteContext>(
  async (request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);
    const { template_id } = await validateBody(request, applyTemplateSchema);

    const { data: menu, error: fetchError } = await supabase
      .from("menus")
      .select("id, content_confirmed_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (fetchError) {
      throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
    }
    if (!menu) {
      throw new NotFoundError("Меню не знайдено.");
    }
    if (!menu.content_confirmed_at) {
      // 422, not 409: docs/api-conventions.md's status table has no 409 —
      // this is treated like any other "request fails a business rule"
      // validation failure, same bucket as a zod schema mismatch.
      throw new ApiError(
        422,
        "content_not_confirmed",
        "Спочатку підтвердьте розпізнані дані меню на кроці перегляду.",
      );
    }

    const { data: template, error: templateError } = await supabase
      .from("menu_templates")
      .select("id")
      .eq("id", template_id)
      .eq("is_active", true)
      .maybeSingle();
    if (templateError) {
      throw new ApiError(500, "db_error", "Не вдалося перевірити шаблон.");
    }
    if (!template) {
      throw new ApiError(422, "invalid_template", "Обраний шаблон недоступний.");
    }

    const { data, error } = await supabase
      .from("menus")
      .update({ template_id, status: "completed" })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();
    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося застосувати шаблон.");
    }
    if (!data) {
      throw new NotFoundError("Меню не знайдено.");
    }

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);
