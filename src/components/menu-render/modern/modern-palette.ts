/**
 * The Modern template's own charcoal-and-gold palette.
 *
 * Literal hex, never `var(--color-*)` — same rule and same reason as
 * MENU_SURFACE (src/lib/utils/resolve-menu-style.ts): a generated menu is a
 * printed artifact belonging to a restaurant, not a surface of this app,
 * and must not follow the app's theme. MENU_SURFACE covers the *neutral*
 * surfaces the classic engine paints; this covers Modern's, which are dark
 * by design rather than by theme.
 *
 * Values are the reference spec's, taken exactly: 38px is 38, #c9a227 is
 * #c9a227.
 *
 * Deliberately not a gradient anywhere — @react-pdf/renderer cannot render
 * CSS gradients at all (see docs/menu-templates-design.md), and this
 * template has to look identical in all three renderers. Any darkening
 * effect must be a semi-transparent solid layer, not a gradient.
 */
export const MODERN_PALETTE = {
  /** Page canvas. */
  page: "#141210",
  /** Title banner fill — one step lighter than the page so the banner reads as a distinct band. */
  banner: "#2a2119",
  /** Hairline under the banner. */
  bannerBorder: "#3d3128",
  /** Gold: superheading, rules, prices, "Chef's pick" badge. */
  gold: "#c9a227",
  /** Primary text (venue name, dish names, category headings). */
  text: "#f5f0e8",
  /** Dish descriptions and footer contact line. */
  textMuted: "#a2988a",
  /** Footer's second line — quieter still than textMuted. */
  textFaint: "#5f574e",
  /** Footer labels. */
  footerText: "#8a8075",
  /** Dotted leader between a dish name and its price. */
  leader: "#55483c",
  /** Footer band fill + its top hairline. */
  footer: "#1c1814",
  footerBorder: "#2e2620",
  /** Vegetarian badge: text + border. */
  badgeVeg: "#8fbf7a",
  badgeVegBorder: "#3f5236",
  /** Chef's-pick badge border (text uses `gold`). */
  badgeGoldBorder: "#5c4a1e",
  /** QR code plate — the code itself must sit on light ground to stay scannable. */
  qrPlate: "#f5f0e8",
} as const;
