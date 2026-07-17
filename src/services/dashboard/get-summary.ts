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

export type CreditBlockMode = "free" | "credits";

/**
 * The sidebar's credits block, in the two modes it can be in.
 *
 * The original design was credits-only, with a bar reading
 * `balance / balance-right-after-the-last-top-up`. That turned out to be
 * unrenderable for essentially the whole user base: registration
 * (handle_new_user) provisions `balance = 0` and writes no ledger row, and
 * credit purchase is paused (Stage 9), so nobody has a positive
 * transaction to anchor a denominator to. The "no positive grants" branch
 * was specified as an edge case but is in fact the normal case, and it left
 * the block — the sidebar's visual anchor — permanently blank.
 *
 * So the block reports whichever budget the user is actually spending:
 * their free menu (mode "free") until a real credit grant exists, then
 * credits (mode "credits"). One component, one layout — only the numbers
 * and the label differ. There is deliberately no "no bar" state.
 */
export interface CreditBlock {
  mode: CreditBlockMode;
  /** Free menus remaining (mode "free") or credits remaining (mode "credits"). */
  value: number;
  /** Free-menu limit (mode "free") or the balance right after the last grant (mode "credits"). */
  total: number;
  /** Bar fill, already clamped to 0..1 — never NaN, never over 1. */
  fillRatio: number;
}

export interface DashboardSummary {
  menuCount: number;
  balance: number;
  freeMenusUsed: number;
  freeMenuLimit: number;
  creditBlock: CreditBlock;
  recentTransactions: DashboardTransaction[];
}

const RECENT_TRANSACTIONS_LIMIT = 5;

function clamp01(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value > 1 ? 1 : value;
}

/**
 * `ledger` must be ascending by created_at. A zero-amount `free_tier` row is
 * written every time a free menu is consumed (see
 * consume_menu_creation_credit), which is why "is there a grant?" tests
 * `amount > 0` rather than row presence — a free-tier row is an audit
 * record, not a grant.
 */
export function computeCreditBlock(
  balance: number,
  freeMenusUsed: number,
  freeMenuLimit: number,
  ledger: { amount: number }[],
): CreditBlock {
  let lastGrantIndex = -1;
  for (let i = ledger.length - 1; i >= 0; i--) {
    if ((ledger[i]?.amount ?? 0) > 0) {
      lastGrantIndex = i;
      break;
    }
  }

  if (lastGrantIndex === -1) {
    const remaining = Math.max(0, freeMenuLimit - freeMenusUsed);
    return {
      mode: "free",
      value: remaining,
      total: freeMenuLimit,
      // freeMenuLimit is config-driven and could in principle be 0; guard
      // rather than divide by it.
      fillRatio: freeMenuLimit > 0 ? clamp01(remaining / freeMenuLimit) : 0,
    };
  }

  // Balance as of immediately after the last grant = every ledger row up to
  // and including it. Reads as "of the last N you were given, M are left",
  // which refills on top-up instead of shrinking forever.
  const total = ledger.slice(0, lastGrantIndex + 1).reduce((sum, row) => sum + row.amount, 0);

  return {
    mode: "credits",
    value: balance,
    total,
    // total <= 0 shouldn't happen (it ends on a positive grant) but a
    // direct balance edit could drift the ledger; guard the division and
    // let clamp01 cap balance > total at a full bar.
    fillRatio: total > 0 ? clamp01(balance / total) : 0,
  };
}

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
  // The ledger query is a 4th member of the same Promise.all, not a
  // follow-up — the sidebar renders on every dashboard navigation, so the
  // credits block must not cost a serial round-trip. It selects `amount`
  // only (no join, no ordering by anything but the index that already
  // exists) and is bounded in practice by one row per credited action:
  // realistically tens of rows, not thousands. If that ever stops being
  // true, this becomes a Postgres-side aggregate.
  const [menuCountResult, balanceResult, transactionsResult, ledgerResult] = await Promise.all([
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
    supabase
      .from("credits_transactions")
      .select("amount")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  const balance = balanceResult.data?.balance ?? 0;
  const freeMenusUsed = balanceResult.data?.free_menus_used ?? 0;

  return {
    menuCount: menuCountResult.count ?? 0,
    balance,
    freeMenusUsed,
    freeMenuLimit: MENU_GENERATOR_CONFIG.freeMenuLimit,
    creditBlock: computeCreditBlock(
      balance,
      freeMenusUsed,
      MENU_GENERATOR_CONFIG.freeMenuLimit,
      ledgerResult.data ?? [],
    ),
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
