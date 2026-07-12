import { apiSuccess } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { listAdminTemplates } from "@/services/admin/templates";

export const GET = withApiHandler(
  async () => {
    const { supabase } = await requireAdmin();

    try {
      const data = await listAdminTemplates(supabase);
      return apiSuccess(data);
    } catch {
      throw new ApiError(500, "db_error", "Не вдалося отримати список шаблонів.");
    }
  },
  { rateLimitTier: "authenticated" },
);
