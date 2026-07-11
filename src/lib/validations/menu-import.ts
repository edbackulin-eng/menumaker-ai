import { z } from "zod";

import { MAX_RAW_TEXT_LENGTH } from "@/lib/validations/ai";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";

export { MAX_RAW_TEXT_LENGTH };

/**
 * Validates the plain object extracted from the incoming FormData (see
 * POST /api/menus/import) — the endpoint isn't JSON (it accepts a file
 * upload), so this doesn't go through the usual validateBody() JSON path.
 */
export const importMenuSchema = z
  .object({
    title: z.string().trim().min(1, "Назва меню обов'язкова.").max(200, "Занадто довга назва."),
    mode: z.enum(["file", "text"], { message: "Некоректний режим імпорту." }),
    text: z
      .string()
      .trim()
      .min(1, "Текст обов'язковий для режиму 'text'.")
      .max(MAX_RAW_TEXT_LENGTH, `Текст не може перевищувати ${MAX_RAW_TEXT_LENGTH} символів.`)
      .optional(),
    locale: z.string().trim().min(2).max(10).optional(),
  })
  .refine((data) => data.mode !== "text" || !!data.text, {
    message: "Текст обов'язковий для режиму 'text'.",
    path: ["text"],
  });
export type ImportMenuInput = z.infer<typeof importMenuSchema>;

export const confirmMenuSchema = z.object({
  content: menuContentSchema,
});
export type ConfirmMenuInput = z.infer<typeof confirmMenuSchema>;

export const applyTemplateSchema = z.object({
  template_id: z.string().uuid("Некоректний ідентифікатор шаблону."),
});
export type ApplyTemplateInput = z.infer<typeof applyTemplateSchema>;
