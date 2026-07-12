import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

const RECENT_REGISTRATIONS_LIMIT = 5;

/**
 * Shared by GET /api/admin/dashboard-stats and the admin Overview page's
 * own SSR render — same "one function, no internal HTTP round trip"
 * reasoning as getDashboardSummary (Stage 8). `admin` must be a
 * service-role client: the underlying RPCs are service_role-only by design
 * (Stage 10 migration) since they scan every user/menu row regardless of
 * RLS, so requireAdmin() at the call site is the only gate.
 */
export async function getAdminDashboardData(admin: SupabaseClient<Database>) {
  const [statsResult, activityResult, recentUsersResult] = await Promise.all([
    admin.rpc("admin_dashboard_stats").single(),
    admin.rpc("admin_daily_activity", { p_days: 30 }),
    admin.rpc("admin_list_users", { p_limit: RECENT_REGISTRATIONS_LIMIT, p_offset: 0 }),
  ]);

  if (statsResult.error || !statsResult.data) {
    throw new Error(`admin_dashboard_stats failed: ${statsResult.error?.message}`);
  }
  if (activityResult.error) {
    throw new Error(`admin_daily_activity failed: ${activityResult.error.message}`);
  }
  if (recentUsersResult.error) {
    throw new Error(`admin_list_users failed: ${recentUsersResult.error.message}`);
  }

  return {
    stats: statsResult.data,
    activity: activityResult.data ?? [],
    recentUsers: recentUsersResult.data ?? [],
  };
}
