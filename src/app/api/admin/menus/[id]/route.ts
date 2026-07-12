import { apiSuccess } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError, NotFoundError } from "@/lib/errors";
import { menuIdParamSchema } from "@/lib/validations/menu";
import { getAdminMenuDetail } from "@/services/admin/menus";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withApiHandler<RouteContext>(
  async (_request, { params }) => {
    const { supabase } = await requireAdmin();
    const { id } = validateParams(await params, menuIdParamSchema);

    let menu;
    try {
      menu = await getAdminMenuDetail(supabase, id);
    } catch {
      throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
    }
    if (!menu) {
      throw new NotFoundError("Меню не знайдено.");
    }

    return apiSuccess(menu);
  },
  { rateLimitTier: "authenticated" },
);
