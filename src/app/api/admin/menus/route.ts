import { apiPaginated } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { validateQuery } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { createServiceClient } from "@/lib/supabase/service";
import { listMenusQuerySchema } from "@/lib/validations/admin";
import { listAdminMenus } from "@/services/admin/menus";

export const GET = withApiHandler(
  async (request) => {
    await requireAdmin();
    const { page, limit, status } = validateQuery(request, listMenusQuerySchema);

    try {
      const { items, total } = await listAdminMenus(createServiceClient(), { status, page, limit });
      return apiPaginated(items, page, limit, total);
    } catch {
      throw new ApiError(500, "db_error", "Не вдалося отримати список меню.");
    }
  },
  { rateLimitTier: "authenticated" },
);
