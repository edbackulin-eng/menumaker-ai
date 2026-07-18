/**
 * Deterministic "no photo" placeholder color, keyed by category name — the
 * same category always renders the same color, across reloads and across
 * every dish in that category, so a menu with several unresolved photos
 * still reads as an intentional design choice rather than a broken one.
 *
 * Literal hex values, not `var(--color-*)` — this lives in the menu-render
 * tree (see MENU_SURFACE in resolve-menu-style.ts), which must stay stable
 * regardless of the app's own theme. Every entry contrasts ≥4.9:1 against
 * white (verified with src/lib/utils/color-contrast.ts's contrastRatio),
 * comfortably above the 3:1 non-text UI threshold — the placeholder's icon
 * is drawn in white.
 */
const PLACEHOLDER_PALETTE = [
  "#c2410c", // burnt orange
  "#a16207", // amber
  "#4d7c0f", // olive
  "#0f766e", // teal
  "#1d4ed8", // indigo
  "#7e22ce", // violet
  "#be123c", // rose
  "#57534e", // stone
] as const;

function hashString(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Same category name -> same color, every time, in every renderer. */
export function getDishPlaceholderColor(categoryName: string): string {
  const key = categoryName.trim().toLowerCase();
  const index = hashString(key) % PLACEHOLDER_PALETTE.length;
  return PLACEHOLDER_PALETTE[index] ?? PLACEHOLDER_PALETTE[0];
}
