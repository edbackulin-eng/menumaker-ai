import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { getDashboardSummary } from "@/services/dashboard/get-summary";

/** Aggregated Dashboard stats in one request — see docs/dashboard.md for why the My Menus page itself doesn't call this internally. */
export const GET = withApiHandler(
  async () => {
    const { user, supabase } = await requireAuth();
    const summary = await getDashboardSummary(supabase, user.id);
    return apiSuccess(summary);
  },
  { rateLimitTier: "authenticated" },
);
