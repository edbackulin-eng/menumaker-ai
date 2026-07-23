import { BUSINESS_TYPES, type BusinessType } from "@/config/business-type";

/**
 * Venue-style suffixes appended to a dish's search query (see
 * PHOTO_CONFIG.styleSuffixEnabled) to nudge Pexels results toward one
 * visual motif per menu instead of a collage of unrelated backgrounds.
 *
 * Keyed by the real `BusinessType` the user picks on the Template step —
 * this file used to declare its own three-value `VenueStyleType` as a
 * stand-in, which meant two competing vocabularies of "venue type" that
 * could drift apart. There is now one, in config/business-type.ts, and a
 * `Record` here so adding a venue type is a compile error until its suffix
 * is chosen rather than a silently missing motif.
 */
const STYLE_SUFFIXES: Record<BusinessType, string> = {
  restaurant: "on wooden board",
  cafe: "on marble surface",
  coffeehouse: "on cafe table",
  bar: "on dark background",
  bakery: "on linen cloth",
};

/**
 * The suffix for a menu's venue type, or `undefined` when the type isn't
 * chosen yet.
 *
 * `undefined` is a real, expected case, not a fallback to some default
 * venue: photos are searched on the Review step, which comes *before* the
 * Template step where the type is picked. Guessing "restaurant" there would
 * bias every menu's first photos toward one motif and then quietly disagree
 * with whatever the user actually picks a step later — so an unchosen type
 * means a plain, unbiased search, and the "re-pick photos" action is what
 * applies the motif once the type is known.
 */
export function styleSuffix(type: BusinessType | null | undefined): string | undefined {
  if (!type) return undefined;
  return STYLE_SUFFIXES[type];
}

/** Narrows a raw `menus.business_type` string from the DB to a BusinessType. */
export function toBusinessType(value: string | null | undefined): BusinessType | null {
  if (!value) return null;
  return BUSINESS_TYPES.some((t) => t.id === value) ? (value as BusinessType) : null;
}
