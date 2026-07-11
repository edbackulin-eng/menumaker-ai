import "server-only";

import { getAIProvider } from "@/services/ai/provider-factory";
import {
  assignContentIds,
  menuContentAiOutputSchema,
  type MenuContent,
} from "@/services/ai/schemas/menu-content";
import type { AIUsage } from "@/services/ai/types";

const SYSTEM = `Ти впорядковуєш частково розпізнані дані меню ресторану: об'єднуєш дублікати категорій, впорядковуєш страви логічно, прибираєш порожні категорії. НЕ вигадуй нових страв, описів чи цін — лише впорядковуй наявні дані. JSON-схема відповіді: {"currency"?: string, "categories": [{"name": string, "items": [{"name": string, "description"?: string, "price"?: number}]}]}.`;

export interface StructureMenuResult {
  content: MenuContent;
  usage: AIUsage;
}

/**
 * `partialData` is deliberately `unknown` — this consumes the messy,
 * partially-recognized output of an earlier parsing step (Stage 7's file
 * import pipeline), which may not yet match menuContentSchema at all. The
 * AI's job here is exactly to bring it into that shape; the *output* is
 * still strictly validated.
 */
export async function structureMenu(partialData: unknown): Promise<StructureMenuResult> {
  const provider = getAIProvider();
  const { data, usage } = await provider.completeStructured({
    system: SYSTEM,
    prompt: `Частково розпізнані дані меню (JSON):\n${JSON.stringify(partialData)}`,
    schema: menuContentAiOutputSchema,
    schemaName: "menu-content",
    maxTokens: 4096,
  });
  // Fresh ids, not a passthrough of any ids `partialData` may have carried —
  // structuring can merge/drop/reorder items, so old identity can't be
  // reliably preserved anyway.
  return { content: assignContentIds(data), usage };
}
