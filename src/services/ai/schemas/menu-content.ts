import { z } from "zod";

/**
 * Canonical shape of `menus.content` (Stage 2's `jsonb not null default
 * '{}'::jsonb`, intentionally left schema-less at the DB layer). This is the
 * first place a concrete structure is defined for it — analyzeMenu,
 * structureMenu and translateMenu all read/write this shape; validated at
 * the application layer via this schema, not a DB constraint, so it can
 * evolve without a migration.
 *
 * `id` (Stage 7.5) gives every category/item a stable identity that
 * survives editing — the interactive editor's drag-and-drop reordering and
 * `menus.style_overrides.categoryOrder`/`itemOrder` reference these ids, not
 * array position (position isn't stable across edits/re-analysis). The AI
 * itself never produces ids — see menuContentAiOutputSchema below and
 * assignContentIds() — so this schema is for *stored/app-facing* content
 * only, never for validating a raw model response.
 */
export const menuItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  price: z.number().nonnegative().optional(),
});

export const menuCategorySchema = z.object({
  id: z.string(),
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

/**
 * What the model actually returns (see AnthropicProvider.completeStructured)
 * — no `id` field. Prompting the model to invent stable, unique ids would
 * burn tokens for no benefit and risks it producing colliding/malformed
 * values; ids are assigned deterministically on our side instead, via
 * assignContentIds().
 */
export const menuItemAiOutputSchema = menuItemSchema.omit({ id: true });
export const menuCategoryAiOutputSchema = z.object({
  name: z.string().trim().min(1),
  items: z.array(menuItemAiOutputSchema),
});
export const menuContentAiOutputSchema = z.object({
  currency: z.string().trim().min(1).max(8).optional(),
  categories: z.array(menuCategoryAiOutputSchema),
});
export type MenuContentAiOutput = z.infer<typeof menuContentAiOutputSchema>;

/** Assigns a fresh id to every category/item in a model response — the only place ids are minted for freshly-analyzed/-restructured content. */
export function assignContentIds(aiOutput: MenuContentAiOutput): MenuContent {
  return {
    ...(aiOutput.currency ? { currency: aiOutput.currency } : {}),
    categories: aiOutput.categories.map((category) => ({
      id: crypto.randomUUID(),
      name: category.name,
      items: category.items.map((item) => ({ id: crypto.randomUUID(), ...item })),
    })),
  };
}
