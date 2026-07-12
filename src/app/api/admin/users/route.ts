import { apiPaginated } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { validateQuery } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { createServiceClient } from "@/lib/supabase/service";
import { listUsersQuerySchema } from "@/lib/validations/admin";
import { listAdminUsers } from "@/services/admin/users";

export const GET = withApiHandler(
  async (request) => {
    await requireAdmin();
    const { page, limit, search, role } = validateQuery(request, listUsersQuerySchema);

    try {
      const { items, total } = await listAdminUsers(createServiceClient(), {
        search,
        role,
        page,
        limit,
      });
      return apiPaginated(items, page, limit, total);
    } catch {
      throw new ApiError(500, "db_error", "Не вдалося отримати список користувачів.");
    }
  },
  { rateLimitTier: "authenticated" },
);
