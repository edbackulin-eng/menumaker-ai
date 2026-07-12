import { apiSuccess } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { validateBody, validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { templateIdParamSchema, updateTemplateSchema } from "@/lib/validations/admin";
import { updateAdminTemplate } from "@/services/admin/templates";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const PATCH = withApiHandler<RouteContext>(
  async (request, { params }) => {
    const { user: adminUser, supabase } = await requireAdmin();
    const { id } = validateParams(await params, templateIdParamSchema);
    const input = await validateBody(request, updateTemplateSchema);

    let data;
    try {
      data = await updateAdminTemplate(supabase, id, input);
    } catch {
      throw new ApiError(500, "db_error", "Не вдалося оновити шаблон.");
    }
    if (!data) {
      throw new NotFoundError("Шаблон не знайдено.");
    }

    logger.info(
      { adminId: adminUser.id, templateId: id, changes: input },
      "admin_template_updated",
    );

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);
