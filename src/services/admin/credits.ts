import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export async function getAdminCreditsStats(admin: SupabaseClient<Database>) {
  const { data, error } = await admin.rpc("admin_credits_breakdown");
  if (error) {
    throw new Error(`admin_credits_breakdown failed: ${error.message}`);
  }

  const breakdown = data ?? [];
  // Ledger convention (Stage 6): grants are positive rows, spends are
  // negative — sum each side separately rather than netting them, since
  // "total granted" and "total spent" answer different questions than
  // their difference does.
  const totalGranted = breakdown
    .filter((row) => row.total_amount > 0)
    .reduce((sum, row) => sum + row.total_amount, 0);
  const totalSpent = breakdown
    .filter((row) => row.total_amount < 0)
    .reduce((sum, row) => sum + Math.abs(row.total_amount), 0);

  return { totalGranted, totalSpent, breakdown };
}
