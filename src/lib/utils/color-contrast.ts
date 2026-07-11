/**
 * WCAG 2.x contrast math (relative luminance + contrast ratio), used to
 * automatically pick a readable text color against any curated accent
 * swatch — see src/config/menu-style.ts for why colors are curated rather
 * than freely chosen, and this is the piece that makes the accent-as-a-
 * background case safe regardless of which swatch is picked.
 */

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return [r, g, b];
}

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(channelToLinear);
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG contrast ratio between two colors, 1 (no contrast) to 21 (max, black vs. white). */
export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Picks whichever of pure black/white contrasts more strongly against `backgroundHex` — used to auto-color text painted on a user-chosen accent swatch. */
export function pickReadableTextColor(backgroundHex: string): "#000000" | "#ffffff" {
  return contrastRatio(backgroundHex, "#000000") >= contrastRatio(backgroundHex, "#ffffff")
    ? "#000000"
    : "#ffffff";
}

/** WCAG AA threshold for normal-size text. */
export const WCAG_AA_NORMAL_TEXT_RATIO = 4.5;
