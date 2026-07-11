import "server-only";

import { getAIProvider } from "@/services/ai/provider-factory";
import { menuContentSchema, type MenuContent } from "@/services/ai/schemas/menu-content";
import type { AIUsage } from "@/services/ai/types";

const SYSTEM = `Ти парсиш сирий текст меню ресторану у структуровані дані. Визнач категорії страв, назви, описи (якщо є) і ціни (лише число, без символу валюти). Ігноруй сторонній текст (номери сторінок, контакти, логотипи). Якщо валюта згадана явно — вкажи її код у полі "currency". JSON-схема відповіді: {"currency"?: string, "categories": [{"name": string, "items": [{"name": string, "description"?: string, "price"?: number}]}]}.`;

export interface AnalyzeMenuResult {
  content: MenuContent;
  usage: AIUsage;
}

export async function analyzeMenu(rawText: string): Promise<AnalyzeMenuResult> {
  const provider = getAIProvider();
  const { data, usage } = await provider.completeStructured({
    system: SYSTEM,
    prompt: `Текст меню:\n"""\n${rawText}\n"""`,
    schema: menuContentSchema,
    schemaName: "menu-content",
    maxTokens: 4096,
  });
  return { content: data, usage };
}
