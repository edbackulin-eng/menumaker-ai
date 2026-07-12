import { apiSuccess } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminCreditsStats } from "@/services/admin/credits";

export const GET = withApiHandler(
  async () => {
    await requireAdmin();

    try {
      const data = await getAdminCreditsStats(createServiceClient());
      return apiSuccess(data);
    } catch {
      throw new ApiError(500, "db_error", "Не вдалося отримати статистику кредитів.");
    }
  },
  { rateLimitTier: "authenticated" },
);
