/**
 * The `grid` engine's colors.
 *
 * Unlike MODERN_PALETTE, which is a single fixed identity, this one is a
 * *default* that a template's `menu_templates.palette` column overrides key
 * by key. That is what makes several Grid presets worth having: without it
 * every Grid template would be the same tiles in the same colors, and the
 * "3-4 presets per venue type" the Template step promises would be a lie.
 *
 * Literal hex only, never `var(--color-*)` — same rule and same reason as
 * MENU_SURFACE and MODERN_PALETTE: a generated menu is a printed artifact
 * belonging to a restaurant and must not follow this app's theme.
 *
 * No gradients: @react-pdf/renderer cannot draw one, and this engine has to
 * look the same in all three renderers.
 */
export interface GridPalette {
  /** Page canvas behind the tiles. */
  page: string;
  /** Tile fill. */
  card: string;
  /** Tile hairline. */
  cardBorder: string;
  /** Dish names, category headings. */
  text: string;
  /** Dish descriptions. */
  textMuted: string;
  /** Prices, the rule under a category heading, chef's-pick badge. */
  accent: string;
  /** Chef's-pick badge border (text uses `accent`). */
  accentBorder: string;
  /** Vegetarian badge: text + border. */
  badgeVeg: string;
  badgeVegBorder: string;
  /** Footer band fill, its top hairline, and its text. */
  footer: string;
  footerBorder: string;
  footerText: string;
}

/**
 * A warm, light, appetite-forward default — deliberately the opposite pole
 * from Modern's charcoal-and-gold, because a menu builder whose two photo
 * engines look alike has one engine too many.
 */
export const GRID_PALETTE_DEFAULT: GridPalette = {
  page: "#fbf9f6",
  card: "#ffffff",
  cardBorder: "#ebe5dc",
  text: "#1c1815",
  textMuted: "#6d6259",
  accent: "#c8482a",
  accentBorder: "#e8bfb2",
  badgeVeg: "#3f7d3a",
  badgeVegBorder: "#bcd8b8",
  footer: "#f3efe8",
  footerBorder: "#e3ddd3",
  footerText: "#6d6259",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Overlays a template's stored palette onto the defaults, one key at a
 * time, ignoring anything that isn't a 6-digit hex string.
 *
 * Per-key rather than all-or-nothing so a preset can restate just the two
 * or three colors that give it its identity (accent, page) and inherit the
 * rest. Per-key also means one bad value costs one color, not the whole
 * palette — a template row edited by hand in the Supabase dashboard should
 * degrade to "mostly right", never to an unreadable render.
 *
 * The hex-only check is not cosmetic: these values are handed to Satori and
 * @react-pdf/renderer, whose color parsers are far less forgiving than a
 * browser's. A stray `"red"` or `"rgb(...)"` that a browser would happily
 * paint can throw inside the PDF stroke path, so it is rejected here rather
 * than at render time.
 */
export function parseGridPalette(raw: Record<string, unknown> | null | undefined): GridPalette {
  if (!raw) return GRID_PALETTE_DEFAULT;
  const merged = { ...GRID_PALETTE_DEFAULT };
  for (const key of Object.keys(GRID_PALETTE_DEFAULT) as (keyof GridPalette)[]) {
    const value = raw[key];
    if (typeof value === "string" && HEX.test(value)) {
      merged[key] = value;
    }
  }
  return merged;
}
