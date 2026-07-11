import "server-only";
import { z } from "zod";

import { AIOutputValidationError } from "@/lib/errors";
import { getAIProvider } from "@/services/ai/provider-factory";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import type { AIUsage } from "@/services/ai/types";

const translationPayloadSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().trim().min(1),
      items: z.array(
        z.object({
          name: z.string().trim().min(1),
          description: z.string().trim().min(1).optional(),
        }),
      ),
    }),
  ),
});
type TranslationPayload = z.infer<typeof translationPayloadSchema>;

const SYSTEM_BASE = `Ти перекладаєш назви категорій і страв меню ресторану на цільову мову. Перекладай ЛИШЕ текстові поля "name" і "description". НЕ додавай і не видаляй категорії чи страви — зберігай точну кількість елементів і їхній порядок. JSON-схема відповіді: {"categories": [{"name": string, "items": [{"name": string, "description"?: string}]}]}.`;

export interface TranslateMenuResult {
  content: MenuContent;
  usage: AIUsage;
}

/** Prices are never sent to the model — they're merged back untouched afterwards, so a translation can't accidentally alter them. */
function toPayload(content: MenuContent) {
  return {
    categories: content.categories.map((category) => ({
      name: category.name,
      items: category.items.map((item) => ({ name: item.name, description: item.description })),
    })),
  };
}

function shapeMatches(content: MenuContent, payload: TranslationPayload): boolean {
  if (payload.categories.length !== content.categories.length) return false;
  return content.categories.every(
    (category, i) => payload.categories[i]!.items.length === category.items.length,
  );
}

function merge(content: MenuContent, payload: TranslationPayload): MenuContent {
  return {
    ...(content.currency ? { currency: content.currency } : {}),
    categories: content.categories.map((category, i) => ({
      name: payload.categories[i]!.name,
      items: category.items.map((item, j) => {
        const translatedDescription = payload.categories[i]!.items[j]!.description;
        return {
          ...item,
          name: payload.categories[i]!.items[j]!.name,
          ...(translatedDescription !== undefined ? { description: translatedDescription } : {}),
        };
      }),
    })),
  };
}

export async function translateMenu(
  content: MenuContent,
  targetLocale: string,
): Promise<TranslateMenuResult> {
  const provider = getAIProvider();
  const payload = toPayload(content);
  const system = `${SYSTEM_BASE} Цільова мова: ${targetLocale}.`;
  const prompt = `Дані для перекладу (JSON):\n${JSON.stringify(payload)}`;

  const first = await provider.completeStructured({
    system,
    prompt,
    schema: translationPayloadSchema,
    schemaName: "menu-translation-payload",
    maxTokens: 4096,
  });

  if (shapeMatches(content, first.data)) {
    return { content: merge(content, first.data), usage: first.usage };
  }

  // completeStructured() already retries once internally on invalid JSON/schema
  // mismatches; this is a second, translateMenu-specific retry for a business
  // invariant (category/item counts) that a generic JSON schema can't express.
  const second = await provider.completeStructured({
    system,
    prompt: `${prompt}\n\nПопередня відповідь мала неправильну кількість категорій або страв. Поверни РІВНО ${content.categories.length} категорій із такою ж кількістю страв у кожній, як у вхідних даних.`,
    schema: translationPayloadSchema,
    schemaName: "menu-translation-payload",
    maxTokens: 4096,
  });

  if (!shapeMatches(content, second.data)) {
    throw new AIOutputValidationError(
      "кількість категорій/страв у перекладі не збігається з оригіналом",
    );
  }

  return {
    content: merge(content, second.data),
    usage: {
      inputTokens: first.usage.inputTokens + second.usage.inputTokens,
      outputTokens: first.usage.outputTokens + second.usage.outputTokens,
    },
  };
}
