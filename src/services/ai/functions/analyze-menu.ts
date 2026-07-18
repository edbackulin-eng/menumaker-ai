import "server-only";

import { getAIProvider } from "@/services/ai/provider-factory";
import {
  assignContentIds,
  menuContentAiOutputSchema,
  type MenuContent,
} from "@/services/ai/schemas/menu-content";
import type { AIUsage } from "@/services/ai/types";

const SYSTEM = `Ти парсиш сирий текст меню ресторану у структуровані дані. Визнач категорії страв, назви, описи (якщо є) і ціни (лише число, без символу валюти). Ігноруй сторонній текст (номери сторінок, контакти, логотипи). Якщо валюта згадана явно — вкажи її код у полі "currency".

Для кожної страви додатково визнач:
- "searchQuery": короткий пошуковий запит АНГЛІЙСЬКОЮ мовою (2-3 слова) для пошуку фотографії цієї страви на стоковому фотосервісі. Приклад: "Вареники з вишнею" -> "cherry dumplings". Якщо страва надто специфічна або незрозуміла для перекладу — залиш поле порожнім (не вигадуй).
- "badges": короткі теги-позначки, якщо вони явно випливають з назви/опису (наприклад "Vegetarian", "Vegan", "Spicy", "Chef's pick", "New") англійською мовою. Якщо нема підстав — залиш порожній масив.

JSON-схема відповіді: {"currency"?: string, "categories": [{"name": string, "items": [{"name": string, "description"?: string, "price"?: number, "searchQuery"?: string, "badges"?: string[]}]}]}.`;

export interface AnalyzeMenuResult {
  content: MenuContent;
  usage: AIUsage;
}

export async function analyzeMenu(rawText: string): Promise<AnalyzeMenuResult> {
  const provider = getAIProvider();
  const { data, usage } = await provider.completeStructured({
    system: SYSTEM,
    prompt: `Текст меню:\n"""\n${rawText}\n"""`,
    schema: menuContentAiOutputSchema,
    schemaName: "menu-content",
    maxTokens: 4096,
  });
  return { content: assignContentIds(data), usage };
}
