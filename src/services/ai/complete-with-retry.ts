import "server-only";
import { z, type ZodType } from "zod";

import { AIOutputValidationError } from "@/lib/errors";
import type { AICompleteParams, AIProvider, AIUsage } from "@/services/ai/types";

/**
 * Same one-retry-on-invalid-output contract as AnthropicProvider.
 * completeStructured(), for plain-text functions (fixText,
 * generateDescription) where the output is a string, not JSON — no shared
 * base with completeStructured() because the two failure modes (bad JSON vs.
 * an empty/too-short string) and their clarification prompts differ.
 */
export async function completeTextWithRetry<T>(
  provider: AIProvider,
  params: AICompleteParams,
  schema: ZodType<T>,
): Promise<{ data: T; usage: AIUsage }> {
  const first = await provider.complete(params);
  const parsedFirst = schema.safeParse(first.text.trim());
  if (parsedFirst.success) {
    return { data: parsedFirst.data, usage: first.usage };
  }

  const second = await provider.complete({
    ...params,
    prompt: `${params.prompt}\n\n(Попередня відповідь була некоректною: ${z.prettifyError(parsedFirst.error)}. Повтори, дотримуючись формату — лише сам текст, без пояснень.)`,
  });
  const parsedSecond = schema.safeParse(second.text.trim());
  if (parsedSecond.success) {
    return { data: parsedSecond.data, usage: second.usage };
  }

  throw new AIOutputValidationError(z.prettifyError(parsedSecond.error));
}
