import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export async function getAdminStatistics(admin: SupabaseClient<Database>, days: number) {
  const [activityResult, localeResult, sourceResult] = await Promise.all([
    admin.rpc("admin_daily_activity", { p_days: days }),
    admin.rpc("admin_locale_breakdown"),
    admin.rpc("admin_registration_source_breakdown"),
  ]);

  if (activityResult.error) {
    throw new Error(`admin_daily_activity failed: ${activityResult.error.message}`);
  }
  if (localeResult.error) {
    throw new Error(`admin_locale_breakdown failed: ${localeResult.error.message}`);
  }
  if (sourceResult.error) {
    throw new Error(`admin_registration_source_breakdown failed: ${sourceResult.error.message}`);
  }

  return {
    activity: activityResult.data ?? [],
    localeBreakdown: localeResult.data ?? [],
    registrationSourceBreakdown: sourceResult.data ?? [],
  };
}
