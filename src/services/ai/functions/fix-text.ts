import "server-only";
import { z } from "zod";

import { completeTextWithRetry } from "@/services/ai/complete-with-retry";
import { getAIProvider } from "@/services/ai/provider-factory";
import type { AIUsage } from "@/services/ai/types";

const fixedTextSchema = z.string().trim().min(1);

export interface FixTextResult {
  text: string;
  usage: AIUsage;
}

export async function fixText(text: string, locale: string): Promise<FixTextResult> {
  const provider = getAIProvider();
  const system = `Ти виправляєш орфографію та граматику тексту меню ресторану мовою з кодом "${locale}". Поверни ЛИШЕ виправлений текст — без пояснень, без лапок, без markdown. Зберігай зміст, перенос рядків і числа незмінними.`;

  const { data, usage } = await completeTextWithRetry(
    provider,
    { system, prompt: text, maxTokens: Math.min(4096, Math.ceil(text.length / 2) + 256) },
    fixedTextSchema,
  );
  return { text: data, usage };
}
