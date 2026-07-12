import { apiNoContent, apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { updateProfileSchema } from "@/lib/validations/profile";
import { createServiceClient } from "@/lib/supabase/service";

export const PATCH = withApiHandler(
  async (request) => {
    const { user, supabase } = await requireAuth();
    const input = await validateBody(request, updateProfileSchema);

    const { data, error } = await supabase
      .from("profiles")
      .update(input)
      .eq("id", user.id)
      .select()
      .single();
    if (error || !data) {
      throw new ApiError(500, "db_error", "Не вдалося оновити профіль.");
    }

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);

/**
 * Account deletion. Uses the service-role client (not the session client
 * PATCH above uses) because deleting an `auth.users` row is an Admin API
 * operation Supabase doesn't expose to a regular session — the cascade
 * through profiles -> credits_balance/credits_transactions/menus/
 * menu_exports/payments is handled entirely by the `on delete cascade` FKs
 * already in place since Stage 2 (verified directly against each
 * migration before relying on it here — see docs/dashboard.md).
 */
export const DELETE = withApiHandler(
  async () => {
    const { user } = await requireAuth();

    const admin = createServiceClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося видалити акаунт.");
    }

    return apiNoContent();
  },
  { rateLimitTier: "authenticated" },
);
