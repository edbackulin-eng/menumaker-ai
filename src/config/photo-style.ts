/**
 * Venue-style suffixes appended to a dish's search query (see
 * PHOTO_CONFIG.styleSuffixEnabled) to nudge Pexels results toward one
 * visual motif per menu instead of a collage of unrelated backgrounds.
 *
 * `VenueStyleType` is a stand-in for the real venue-type system Stage 3
 * will add — the caller (the photo search route) passes a hardcoded
 * default today. This function's shape doesn't change when that lands:
 * Stage 3 only needs to pass a different (real, per-menu) `type` in.
 */
export type VenueStyleType = "restaurant" | "cafe" | "bar";

const STYLE_SUFFIXES: Record<VenueStyleType, string> = {
  restaurant: "on wooden board",
  cafe: "on marble surface",
  bar: "on dark background",
};

export function styleSuffix(type: VenueStyleType): string {
  return STYLE_SUFFIXES[type];
}

/** Stand-in until Stage 3 wires a real per-menu venue type. */
export const DEFAULT_VENUE_STYLE_TYPE: VenueStyleType = "restaurant";
