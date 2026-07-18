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
  /**
   * Short English search query for dish-photo lookup (Stage 2), minted by
   * analyzeMenu itself — the same call already reads name/description/
   * category, so it has more context than a dictionary translation would.
   * Optional: menus imported before Stage 2 have no such field, and the
   * photo lookup service falls back to a transliterated/original name
   * rather than sending an empty query to the photo provider.
   */
  searchQuery: z.string().trim().min(1).optional(),
  /**
   * Free-form tags (e.g. "Vegetarian", "Chef's pick") the AI infers from
   * name/description. Rendering is gated by a template config flag, not by
   * this schema, so a noisy model output can be hidden without a migration
   * — see the Modern template's `showBadges` config.
   */
  badges: z.array(z.string().trim().min(1)).optional(),
  /**
   * Resolved photo URL for this dish (Stage 2) — either a Pexels result
   * cached via findDishPhoto(), or a user-uploaded replacement in the
   * `menu-photos` bucket. Never set by the AI (see menuItemAiOutputSchema
   * below): only POST /api/menus/[id]/items/[itemId]/photo/search and
   * .../photo (upload) ever write this field. Absent means "no photo
   * resolved yet" — renderers show a category-colored placeholder
   * (dish-photo-placeholder.tsx), not an error.
   */
  photoUrl: z.string().trim().min(1).optional(),
});

export const menuCategorySchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  items: z.array(menuItemSchema),
});

/**
 * The restaurant this menu belongs to (Stage 2 final, Modern template).
 * Lives here rather than as `menus` columns for the same reason the rest of
 * this shape does — see this file's header: `menus.content` is deliberately
 * schema-less at the DB layer so it can grow without a migration, exactly
 * how `searchQuery`/`badges`/`photoUrl` were added.
 *
 * Every field is optional and every consumer must degrade gracefully: the
 * Modern banner falls back to `menus.title` for the name (so there is
 * always *something* to show) and simply omits the tagline/address/phone
 * rows when they're absent, rather than rendering empty ones. Nothing in
 * the app writes these yet — Stage 3 adds the form; until then a menu
 * renders correctly with `venue` entirely missing.
 */
export const menuVenueSchema = z.object({
  name: z.string().trim().min(1).optional(),
  /** Spaced-caps superheading above the venue name, e.g. "Italian kitchen · since 2014". */
  tagline: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
});

export const menuContentSchema = z.object({
  currency: z.string().trim().min(1).max(8).optional(),
  venue: menuVenueSchema.optional(),
  categories: z.array(menuCategorySchema),
});

export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuCategory = z.infer<typeof menuCategorySchema>;
export type MenuVenue = z.infer<typeof menuVenueSchema>;
export type MenuContent = z.infer<typeof menuContentSchema>;

/**
 * What the model actually returns (see AnthropicProvider.completeStructured)
 * — no `id` field. Prompting the model to invent stable, unique ids would
 * burn tokens for no benefit and risks it producing colliding/malformed
 * values; ids are assigned deterministically on our side instead, via
 * assignContentIds().
 */
export const menuItemAiOutputSchema = menuItemSchema.omit({ id: true, photoUrl: true });
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
