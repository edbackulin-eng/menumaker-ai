import { z } from "zod";

import { BUSINESS_TYPES } from "@/config/business-type";

const businessTypeIds = BUSINESS_TYPES.map((t) => t.id) as [string, ...string[]];

export const menuIdParamSchema = z.object({
  id: z.string().uuid("Некоректний ідентифікатор меню."),
});

export const listMenusQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListMenusQuery = z.infer<typeof listMenusQuerySchema>;

export const createMenuSchema = z.object({
  title: z.string().trim().min(1, "Назва обов'язкова.").max(200, "Занадто довга назва."),
  template_id: z.string().uuid("Некоректний template_id.").nullable().optional(),
});
export type CreateMenuInput = z.infer<typeof createMenuSchema>;

export const updateMenuSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Назва обов'язкова.")
      .max(200, "Занадто довга назва.")
      .optional(),
    template_id: z.string().uuid("Некоректний template_id.").nullable().optional(),
    status: z.enum(["draft", "processing", "completed", "failed"]).optional(),
    content: z.record(z.string(), z.unknown()).optional(),
    locale: z.string().trim().min(2).max(10).optional(),
    business_type: z.enum(businessTypeIds).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Потрібно вказати хоча б одне поле для оновлення.",
  });
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
