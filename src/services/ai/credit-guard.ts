import "server-only";

import { ApiError, InsufficientCreditsError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { createServiceClient } from "@/lib/supabase/service";
import type { AIUsage } from "@/services/ai/types";
import type { Database } from "@/types/database.types";

type CreditTransactionType = Database["public"]["Enums"]["credit_transaction_type"];

export interface RunCreditedAiCallOptions<T> {
  userId: string;
  /** credit_costs.action_type — the fine-grained pricing key (see docs/ai-service.md for the mapping). */
  actionType: string;
  /** credits_transactions.type — the coarser ledger category this action rolls up into. */
  transactionType: CreditTransactionType;
  description: string;
  relatedMenuId?: string;
  call: () => Promise<{ data: T; usage: AIUsage }>;
}

export interface RunCreditedAiCallResult<T> {
  data: T;
  usage: AIUsage;
  balance: number;
}

/**
 * Wraps an AI function call with the credit lifecycle every AI endpoint
 * needs (docs/ai-service.md): look up the action's price, reject early if
 * the balance clearly can't cover it, run the (potentially expensive) AI
 * call, and only deduct — atomically, via the spend_credits() SQL function
 * — after it succeeds. A failed AI call never reaches the deduction step,
 * so a failed provider call costs the user nothing.
 */
export async function runCreditedAiCall<T>(
  options: RunCreditedAiCallOptions<T>,
): Promise<RunCreditedAiCallResult<T>> {
  const supabase = createServiceClient();

  const { data: costRow, error: costError } = await supabase
    .from("credit_costs")
    .select("cost")
    .eq("action_type", options.actionType)
    .eq("is_active", true)
    .maybeSingle();

  if (costError || !costRow) {
    throw new ApiError(
      500,
      "credit_cost_not_configured",
      `Не налаштована вартість дії "${options.actionType}".`,
    );
  }
  const cost = costRow.cost;

  const { data: balanceRow } = await supabase
    .from("credits_balance")
    .select("balance")
    .eq("user_id", options.userId)
    .maybeSingle();

  // Cheap pre-flight check before spending money on the AI call — the real,
  // race-safe enforcement is the atomic spend_credits() call below.
  if (!balanceRow || balanceRow.balance < cost) {
    throw new InsufficientCreditsError();
  }

  const start = Date.now();
  let result: { data: T; usage: AIUsage };
  try {
    result = await options.call();
  } catch (error) {
    logger.warn(
      { err: error, actionType: options.actionType, userId: options.userId },
      "ai_call_failed_no_charge",
    );
    throw error;
  }
  const durationMs = Date.now() - start;

  const { data: spendRows, error: spendError } = await supabase.rpc("spend_credits", {
    p_user_id: options.userId,
    p_amount: cost,
    p_type: options.transactionType,
    p_description: options.description,
    p_related_menu_id: options.relatedMenuId,
  });

  const spendResult = spendRows?.[0];
  if (spendError || !spendResult?.success) {
    // The AI already answered successfully but the balance changed
    // underneath us (a race with another concurrent spend) — we eat the
    // provider cost ourselves rather than serve an unpaid-for result.
    logger.error(
      { err: spendError, actionType: options.actionType, userId: options.userId },
      "credit_spend_failed_after_ai_success",
    );
    throw new InsufficientCreditsError();
  }

  logger.info(
    {
      actionType: options.actionType,
      userId: options.userId,
      cost,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      durationMs,
    },
    "ai_call_succeeded",
  );

  return { data: result.data, usage: result.usage, balance: spendResult.new_balance };
}
