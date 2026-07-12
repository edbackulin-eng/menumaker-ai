import { z } from "zod";

import { isReservedSlug } from "@/config/reserved-slugs";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Посилання має містити щонайменше 3 символи.")
  .max(60, "Посилання не може перевищувати 60 символів.")
  .regex(
    SLUG_PATTERN,
    "Лише латинські літери, цифри та дефіси (без пробілів, без дефісів на початку/в кінці чи підряд).",
  )
  .refine((value) => !isReservedSlug(value), {
    message: "Це посилання зарезервоване системою — оберіть інше.",
  });

/** slug omitted => server generates one from the menu's title (see generateSlugSuggestion). */
export const publishMenuSchema = z.object({
  is_public: z.literal(true),
  slug: slugSchema.optional(),
});
export type PublishMenuInput = z.infer<typeof publishMenuSchema>;

export const unpublishMenuSchema = z.object({
  is_public: z.literal(false),
});
export type UnpublishMenuInput = z.infer<typeof unpublishMenuSchema>;

export const publishRequestSchema = z.union([publishMenuSchema, unpublishMenuSchema]);
export type PublishRequestInput = z.infer<typeof publishRequestSchema>;
