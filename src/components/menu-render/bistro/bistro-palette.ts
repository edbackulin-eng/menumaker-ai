/**
 * The `classic-elegant` (Bistro) engine's colors.
 *
 * A fine-dining printed card: warm paper ground, near-black serif text, one
 * restrained accent for rules and prices. Deliberately the calm opposite of
 * Grid's photo-forward tiles and Modern's dark drama — a dense text menu
 * where the typography is the whole design and color stays out of its way.
 *
 * Same rules as the other engine palettes: literal hex only (never
 * `var(--color-*)`, a menu is a printed artifact and must not follow the
 * app theme), and no gradients (react-pdf can't draw them and this engine
 * has to look identical in all three renderers).
 *
 * Overridable per template via menu_templates.palette + parseBistroPalette,
 * same key-by-key mechanism as Grid — that is what lets the presets differ
 * (warm cream vs. cool ivory vs. near-black) without a code change each.
 */
export interface BistroPalette {
  /** Paper ground. */
  page: string;
  /** All body + heading text. */
  text: string;
  /** Dish descriptions, the tagline. */
  textMuted: string;
  /** Prices, rules under the venue name and category headings, the dotted leader. */
  accent: string;
  /** Hairline framing the header block. */
  rule: string;
  /** Footer contact line + its top hairline. */
  footerText: string;
  footerRule: string;
}

/** Warm cream + charcoal + muted gold — the default fine-dining look. */
export const BISTRO_PALETTE_DEFAULT: BistroPalette = {
  page: "#f7f3ea",
  text: "#221e18",
  textMuted: "#6b6357",
  accent: "#9c7c3c",
  rule: "#d8cfbc",
  footerText: "#6b6357",
  footerRule: "#d8cfbc",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Overlays a template's stored palette onto the defaults key by key,
 * ignoring anything that isn't a 6-digit hex. Identical policy to Grid's
 * parseGridPalette (see its doc comment): per-key so a preset restates only
 * the colors that define it, hex-only because Satori and react-pdf reject
 * the looser color strings a browser would accept.
 */
export function parseBistroPalette(raw: Record<string, unknown> | null | undefined): BistroPalette {
  if (!raw) return BISTRO_PALETTE_DEFAULT;
  const merged = { ...BISTRO_PALETTE_DEFAULT };
  for (const key of Object.keys(BISTRO_PALETTE_DEFAULT) as (keyof BistroPalette)[]) {
    const value = raw[key];
    if (typeof value === "string" && HEX.test(value)) {
      merged[key] = value;
    }
  }
  return merged;
}
