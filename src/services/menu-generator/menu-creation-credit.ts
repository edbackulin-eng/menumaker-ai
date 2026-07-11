import "server-only";

import { MENU_GENERATOR_CONFIG } from "@/config/menu-generator";
import { ApiError, InsufficientCreditsError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { analyzeMenu } from "@/services/ai/functions/analyze-menu";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { createServiceClient } from "@/lib/supabase/service";

const ACTION_TYPE = "menu_generation";

/**
 * The Menu Generator's paid step deliberately does NOT go through
 * src/services/ai/credit-guard.ts's runCreditedAiCall(): that helper always
 * spends paid credits, but here the first `freeMenuLimit` menus must be
 * free (credits_balance.free_menus_used) instead — a different ledger
 * branch, atomically decided by consume_menu_creation_credit() (migration
 * 20260712091000). See docs/menu-generator.md for the full write-up of why
 * charging happens here (at analyze time) rather than at wizard completion.
 */
async function getMenuGenerationCost(): Promise<number> {
  const supabase = createServiceClient();
  const { data: costRow, error } = await supabase
    .from("credit_costs")
    .select("cost")
    .eq("action_type", ACTION_TYPE)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !costRow) {
    throw new ApiError(
      500,
      "credit_cost_not_configured",
      `Не налаштована вартість дії "${ACTION_TYPE}".`,
    );
  }
  return costRow.cost;
}

/**
 * Cheap pre-flight check before any parsing/upload/AI work starts — avoids
 * doing that work for a request we already know can't be charged. The real,
 * race-safe enforcement is consume_menu_creation_credit()'s atomic row lock,
 * exercised later in analyzeMenuWithCreditGate().
 */
export async function assertMenuCreationEligible(userId: string): Promise<void> {
  const cost = await getMenuGenerationCost();
  const supabase = createServiceClient();
  const { data: balanceRow } = await supabase
    .from("credits_balance")
    .select("balance, free_menus_used")
    .eq("user_id", userId)
    .maybeSingle();

  const eligible =
    !!balanceRow &&
    (balanceRow.free_menus_used < MENU_GENERATOR_CONFIG.freeMenuLimit ||
      balanceRow.balance >= cost);

  if (!eligible) {
    throw new InsufficientCreditsError();
  }
}

export interface AnalyzeMenuWithCreditGateResult {
  content: MenuContent;
  usedFreeMenu: boolean;
  balance: number;
}

/**
 * Runs the real AI call uncredited, then only commits a charge (free-tier
 * consumption or paid spend) if the result actually recognized at least one
 * item — an empty-but-schema-valid result (unreadable/blank file) is not
 * "success" from the user's perspective and must not cost them their one
 * free menu or a paid credit. See the `nothing_recognized` throw below;
 * callers (POST /api/menus/import) mark the menu `status = 'failed'` on it.
 */
export async function analyzeMenuWithCreditGate(
  userId: string,
  menuId: string,
  rawText: string,
): Promise<AnalyzeMenuWithCreditGateResult> {
  const { content } = await analyzeMenu(rawText);

  const totalItems = content.categories.reduce((sum, category) => sum + category.items.length, 0);
  if (totalItems === 0) {
    throw new ApiError(
      422,
      "nothing_recognized",
      "AI не зміг розпізнати жодної страви в цьому файлі. Перевірте, що файл містить читабельний текст меню, і спробуйте ще раз.",
    );
  }

  const cost = await getMenuGenerationCost();
  const supabase = createServiceClient();
  const { data: rows, error } = await supabase.rpc("consume_menu_creation_credit", {
    p_user_id: userId,
    p_free_limit: MENU_GENERATOR_CONFIG.freeMenuLimit,
    p_cost: cost,
    p_related_menu_id: menuId,
    p_description: "Меню: аналіз при створенні (import)",
  });

  const result = rows?.[0];
  if (error || !result?.success) {
    logger.error(
      { err: error, userId, menuId },
      "menu_creation_credit_spend_failed_after_ai_success",
    );
    throw new InsufficientCreditsError();
  }

  logger.info(
    { userId, menuId, usedFreeMenu: result.used_free, cost, totalItems },
    "menu_creation_ai_call_succeeded",
  );

  return { content, usedFreeMenu: result.used_free, balance: result.new_balance };
}
