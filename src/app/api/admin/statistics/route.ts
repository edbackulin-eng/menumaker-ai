import { apiSuccess } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { validateQuery } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { createServiceClient } from "@/lib/supabase/service";
import { statisticsRangeQuerySchema } from "@/lib/validations/admin";
import { getAdminStatistics } from "@/services/admin/statistics";

export const GET = withApiHandler(
  async (request) => {
    await requireAdmin();
    const { days } = validateQuery(request, statisticsRangeQuerySchema);

    try {
      const data = await getAdminStatistics(createServiceClient(), days);
      return apiSuccess(data);
    } catch {
      throw new ApiError(500, "db_error", "Не вдалося отримати статистику.");
    }
  },
  { rateLimitTier: "authenticated" },
);
