import "server-only";
import { z } from "zod";

import { getAIProvider } from "@/services/ai/provider-factory";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import type { AIUsage } from "@/services/ai/types";

const suggestionsSchema = z.object({
  suggestions: z.array(z.string().trim().min(1)).min(1).max(15),
});

const SYSTEM = `Ти аналізуєш меню ресторану і даєш до 8 конкретних, стислих порад щодо покращення (відсутні описи, непослідовні ціни, дублікати страв, незрозумілі назви тощо). Кожна порада — одне речення українською мовою. Якщо покращувати нічого — поверни одну пораду, що меню виглядає добре. JSON-схема відповіді: {"suggestions": string[]}.`;

export interface SuggestImprovementsResult {
  suggestions: string[];
  usage: AIUsage;
}

export async function suggestImprovements(
  content: MenuContent,
): Promise<SuggestImprovementsResult> {
  const provider = getAIProvider();
  const { data, usage } = await provider.completeStructured({
    system: SYSTEM,
    prompt: `Меню (JSON):\n${JSON.stringify(content)}`,
    schema: suggestionsSchema,
    schemaName: "suggestions",
    maxTokens: 1024,
  });
  return { suggestions: data.suggestions, usage };
}
