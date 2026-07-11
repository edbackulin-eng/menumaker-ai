import { z } from "zod";

import { menuContentSchema } from "@/services/ai/schemas/menu-content";

/**
 * ~20k characters is roughly 5-6k tokens of input for a Haiku call —
 * comfortably inside the model's context window while keeping a single
 * analyze/fix-text request cheap and bounded, per the PO's $10-60/mo budget
 * brief. Rejected explicitly (422) rather than silently truncated, so the
 * caller knows their text was cut instead of getting a partial menu.
 */
export const MAX_RAW_TEXT_LENGTH = 20000;

export const analyzeMenuSchema = z.object({
  rawText: z
    .string()
    .trim()
    .min(1, "Текст меню обов'язковий.")
    .max(MAX_RAW_TEXT_LENGTH, `Текст меню не може перевищувати ${MAX_RAW_TEXT_LENGTH} символів.`),
});

export const fixTextSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Текст обов'язковий.")
    .max(MAX_RAW_TEXT_LENGTH, `Текст не може перевищувати ${MAX_RAW_TEXT_LENGTH} символів.`),
  locale: z.string().trim().min(2).max(10),
});

export const translateMenuSchema = z.object({
  content: menuContentSchema,
  targetLocale: z.string().trim().min(2).max(10),
});

export const generateDescriptionSchema = z.object({
  dishName: z.string().trim().min(1, "Назва страви обов'язкова.").max(200),
  context: z.string().trim().max(500).optional(),
});

export const suggestImprovementsSchema = z.object({
  content: menuContentSchema,
});
