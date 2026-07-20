/**
 * The `editorial` engine's colors.
 *
 * A magazine feature spread: clean near-white ground, near-black display
 * text, one restrained accent. High-contrast and airy where Bistro is warm
 * and dense — the two share "typographic and elegant" but read as
 * different publications, which is the point of having both.
 *
 * Same rules as the other engine palettes: literal hex only (never
 * `var(--color-*)`), no gradients (react-pdf can't draw them and this
 * engine has to look identical in all three renderers). Overridable per
 * template via menu_templates.palette + parseEditorialPalette.
 */
export interface EditorialPalette {
  /** Page ground. */
  page: string;
  /** Display headings + dish names. */
  text: string;
  /** Dish descriptions, the standfirst/tagline. */
  textMuted: string;
  /** Prices, the kicker rule, section numerals. */
  accent: string;
  /** Hairline rules between dishes and framing the masthead. */
  rule: string;
  /** Fallback fill behind a category whose lead dish has no photo. */
  heroPlaceholder: string;
  /** Footer contact line + its top hairline. */
  footerText: string;
  footerRule: string;
}

/** Clean gallery white, ink-black text, a deep terracotta accent. */
export const EDITORIAL_PALETTE_DEFAULT: EditorialPalette = {
  page: "#fcfbf9",
  text: "#1a1a1a",
  textMuted: "#5f5b55",
  accent: "#b0472b",
  rule: "#e4e0d8",
  heroPlaceholder: "#e8e3d8",
  footerText: "#5f5b55",
  footerRule: "#e4e0d8",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Overlays a template's stored palette onto the defaults key by key,
 * ignoring anything that isn't a 6-digit hex. Identical policy to Grid's
 * and Bistro's parsers — per-key so a preset restates only its defining
 * colors, hex-only because Satori and react-pdf reject the looser color
 * strings a browser would accept.
 */
export function parseEditorialPalette(
  raw: Record<string, unknown> | null | undefined,
): EditorialPalette {
  if (!raw) return EDITORIAL_PALETTE_DEFAULT;
  const merged = { ...EDITORIAL_PALETTE_DEFAULT };
  for (const key of Object.keys(EDITORIAL_PALETTE_DEFAULT) as (keyof EditorialPalette)[]) {
    const value = raw[key];
    if (typeof value === "string" && HEX.test(value)) {
      merged[key] = value;
    }
  }
  return merged;
}

/**
 * The lead photo for a category's hero band: the first item that actually
 * has one. `undefined` when no item in the category has a photo — the
 * renderer then draws a flat `heroPlaceholder` band so the section still
 * opens with a deliberate visual, never a collapsed gap.
 *
 * Shared by all three renderers so the same dish's photo leads a given
 * category everywhere, keeping Web/PDF/PNG identical.
 */
export function categoryHeroPhotoUrl(items: { photoUrl?: string }[]): string | undefined {
  return items.find((item) => item.photoUrl)?.photoUrl;
}
