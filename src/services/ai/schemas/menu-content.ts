import { z } from "zod";

/**
 * Canonical shape of `menus.content` (Stage 2's `jsonb not null default
 * '{}'::jsonb`, intentionally left schema-less at the DB layer). This is the
 * first place a concrete structure is defined for it — analyzeMenu,
 * structureMenu and translateMenu all read/write this shape; validated at
 * the application layer via this schema, not a DB constraint, so it can
 * evolve without a migration.
 */
export const menuItemSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  price: z.number().nonnegative().optional(),
});

export const menuCategorySchema = z.object({
  name: z.string().trim().min(1),
  items: z.array(menuItemSchema),
});

export const menuContentSchema = z.object({
  currency: z.string().trim().min(1).max(8).optional(),
  categories: z.array(menuCategorySchema),
});

export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuCategory = z.infer<typeof menuCategorySchema>;
export type MenuContent = z.infer<typeof menuContentSchema>;
