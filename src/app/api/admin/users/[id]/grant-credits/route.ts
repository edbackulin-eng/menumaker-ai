import { apiSuccess } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/api/require-auth";
import { validateBody, validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { createServiceClient } from "@/lib/supabase/service";
import { grantCreditsSchema, userIdParamSchema } from "@/lib/validations/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = withApiHandler<RouteContext>(
  async (request, { params }) => {
    const { user: adminUser } = await requireAdmin();
    const { id } = validateParams(await params, userIdParamSchema);
    const { amount, reason } = await validateBody(request, grantCreditsSchema);

    const admin = createServiceClient();
    const { data, error } = await admin
      .rpc("admin_grant_credits", {
        p_admin_id: adminUser.id,
        p_target_user_id: id,
        p_amount: amount,
        p_reason: reason,
      })
      .single();

    if (error) {
      logger.warn(
        { err: error, adminId: adminUser.id, targetUserId: id, amount },
        "admin_credit_grant_failed",
      );
      throw new ApiError(422, "credit_grant_failed", error.message);
    }

    logger.info(
      { adminId: adminUser.id, targetUserId: id, amount, reason, newBalance: data?.new_balance },
      "admin_credits_granted",
    );

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);
