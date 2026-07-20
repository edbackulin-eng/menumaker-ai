/**
 * The venue types a menu can belong to — the axis the Template step's tabs
 * filter templates along, and the value stored in `menus.business_type`.
 *
 * Kept in lockstep with two other places by construction, not by hope:
 * - the `menus.business_type` CHECK constraint and the
 *   `menu_templates.business_types` values (migration
 *   20260719090000_template_engines_and_business_types.sql), and
 * - `VenueStyleType` in src/config/photo-style.ts, which the photo-search
 *   suffix reads — Stage 3 (pt.5) unifies that type with this one so there
 *   is a single vocabulary of venue types.
 *
 * `label` is a next-intl message key under `menuGenerator.template.venueType`,
 * not a literal — the tabs are user-facing UI and must translate.
 */
export const BUSINESS_TYPES = [
  { id: "restaurant", labelKey: "restaurant" },
  { id: "cafe", labelKey: "cafe" },
  { id: "coffeehouse", labelKey: "coffeehouse" },
  { id: "bar", labelKey: "bar" },
  { id: "bakery", labelKey: "bakery" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["id"];

export function isBusinessType(value: string): value is BusinessType {
  return BUSINESS_TYPES.some((type) => type.id === value);
}

/**
 * The tab shown first when a menu has no `business_type` yet. Not written to
 * the menu until the user actually picks a tab — a default *view* is not the
 * same as a chosen *value*, and `NULL` must keep meaning "not chosen" (see
 * the column's own comment).
 */
export const DEFAULT_BUSINESS_TYPE: BusinessType = "restaurant";
