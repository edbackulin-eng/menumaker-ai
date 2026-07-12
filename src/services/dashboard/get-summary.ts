import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import { MENU_GENERATOR_CONFIG } from "@/config/menu-generator";
import type { Database } from "@/types/database.types";

export interface DashboardTransaction {
  id: string;
  amount: number;
  type: Database["public"]["Enums"]["credit_transaction_type"];
  description: string | null;
  created_at: string;
  related_menu_id: string | null;
  related_menu_title: string | null;
}

export interface DashboardSummary {
  menuCount: number;
  balance: number;
  freeMenusUsed: number;
  freeMenuLimit: number;
  recentTransactions: DashboardTransaction[];
}

const RECENT_TRANSACTIONS_LIMIT = 5;

/**
 * Shared by GET /api/dashboard/summary (a standalone, independently
 * reachable endpoint per the spec — useful for a future client-side
 * refresh) and the My Menus page's own server-side render. The page itself
 * calls this directly rather than fetching its own API route: an SSR page
 * doing an internal HTTP round-trip to its own server would only add
 * latency, not save it — the actual "avoid multiple round trips" goal from
 * the brief is met by this single function doing one Promise.all, not by
 * literally routing every consumer through HTTP.
 */
export async function getDashboardSummary(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DashboardSummary> {
  const [menuCountResult, balanceResult, transactionsResult] = await Promise.all([
    supabase.from("menus").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("credits_balance")
      .select("balance, free_menus_used")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("credits_transactions")
      .select("id, amount, type, description, created_at, related_menu_id, menus(title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(RECENT_TRANSACTIONS_LIMIT),
  ]);

  return {
    menuCount: menuCountResult.count ?? 0,
    balance: balanceResult.data?.balance ?? 0,
    freeMenusUsed: balanceResult.data?.free_menus_used ?? 0,
    freeMenuLimit: MENU_GENERATOR_CONFIG.freeMenuLimit,
    recentTransactions: (transactionsResult.data ?? []).map((row) => ({
      id: row.id,
      amount: row.amount,
      type: row.type,
      description: row.description,
      created_at: row.created_at,
      related_menu_id: row.related_menu_id,
      related_menu_title: row.menus?.title ?? null,
    })),
  };
}
