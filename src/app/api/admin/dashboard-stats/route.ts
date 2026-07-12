import { apiSuccess } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminDashboardData } from "@/services/admin/dashboard";

export const GET = withApiHandler(
  async () => {
    await requireAdmin();

    try {
      const data = await getAdminDashboardData(createServiceClient());
      return apiSuccess(data);
    } catch {
      throw new ApiError(500, "db_error", "Не вдалося отримати статистику дашборду.");
    }
  },
  { rateLimitTier: "authenticated" },
);
