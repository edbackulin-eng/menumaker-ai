import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().uuid("Некоректний ідентифікатор користувача."),
});

export const templateIdParamSchema = z.object({
  id: z.string().uuid("Некоректний ідентифікатор шаблону."),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  role: z.enum(["user", "admin"]).optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const changeRoleSchema = z.object({
  role: z.enum(["user", "admin"], { message: "Некоректна роль." }),
});
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

export const grantCreditsSchema = z.object({
  amount: z.coerce
    .number()
    .int("Кількість кредитів має бути цілим числом.")
    .positive("Кількість кредитів має бути більшою за нуль.")
    .max(100000, "Занадто велика кількість кредитів за одне нарахування."),
  reason: z
    .string()
    .trim()
    .min(3, "Опишіть причину нарахування (мінімум 3 символи).")
    .max(500, "Занадто довга причина."),
});
export type GrantCreditsInput = z.infer<typeof grantCreditsSchema>;

export const listMenusQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["draft", "processing", "completed", "failed"]).optional(),
});
export type AdminListMenusQuery = z.infer<typeof listMenusQuerySchema>;

export const updateTemplateSchema = z
  .object({
    name: z
      .object({
        en: z.string().trim().min(1).max(100).optional(),
        uk: z.string().trim().min(1).max(100).optional(),
      })
      .optional(),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().min(0).max(10000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Потрібно вказати хоча б одне поле для оновлення.",
  });
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

export const statisticsRangeQuerySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .refine((v) => [7, 30, 90].includes(v), {
      message: "Діапазон має бути 7, 30 або 90 днів.",
    })
    .default(30),
});
export type StatisticsRangeQuery = z.infer<typeof statisticsRangeQuerySchema>;
