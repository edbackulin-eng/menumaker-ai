import { apiSuccess } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { validateBody, validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { createServiceClient } from "@/lib/supabase/service";
import { changeRoleSchema, userIdParamSchema } from "@/lib/validations/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Role changes go through admin_change_user_role() (service_role only),
 * not a plain `.update()` — even though RLS would technically allow an
 * admin session to write profiles.role directly, the SQL function is what
 * guarantees the audit_log entry and the "can't demote yourself" guard are
 * never skipped, regardless of which client happens to call this route.
 */
export const PATCH = withApiHandler<RouteContext>(
  async (request, { params }) => {
    const { user: adminUser } = await requireAdmin();
    const { id } = validateParams(await params, userIdParamSchema);
    const { role } = await validateBody(request, changeRoleSchema);

    const admin = createServiceClient();
    const { data, error } = await admin
      .rpc("admin_change_user_role", {
        p_admin_id: adminUser.id,
        p_target_user_id: id,
        p_new_role: role,
      })
      .single();

    if (error) {
      logger.warn(
        { err: error, adminId: adminUser.id, targetUserId: id },
        "admin_role_change_failed",
      );
      throw new ApiError(422, "role_change_failed", error.message);
    }

    logger.info(
      { adminId: adminUser.id, targetUserId: id, oldRole: data?.old_role, newRole: data?.new_role },
      "admin_role_changed",
    );

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);
