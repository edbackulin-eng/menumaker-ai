import "server-only";
import { z } from "zod";

import { completeTextWithRetry } from "@/services/ai/complete-with-retry";
import { getAIProvider } from "@/services/ai/provider-factory";
import type { AIUsage } from "@/services/ai/types";

const descriptionSchema = z.string().trim().min(1).max(500);

export interface GenerateDescriptionResult {
  description: string;
  usage: AIUsage;
}

export async function generateDescription(
  dishName: string,
  context?: string,
): Promise<GenerateDescriptionResult> {
  const provider = getAIProvider();
  const system = `Ти пишеш апетитний опис страви для меню ресторану: 1-2 короткі речення, без емодзі й зайвого пафосу. Поверни ЛИШЕ текст опису, без лапок і пояснень.`;
  const prompt = context ? `Страва: ${dishName}\nКонтекст: ${context}` : `Страва: ${dishName}`;

  const { data, usage } = await completeTextWithRetry(
    provider,
    { system, prompt, maxTokens: 256 },
    descriptionSchema,
  );
  return { description: data, usage };
}
