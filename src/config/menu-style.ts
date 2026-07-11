/**
 * Curated options for the interactive menu style editor (Stage 7.5) — the
 * single source of truth for what a user is allowed to pick. The client UI
 * only ever renders these; the backend (src/lib/validations/menu-style.ts)
 * independently re-validates against the same lists, so a hand-crafted API
 * request can't smuggle an arbitrary color/font past the UI.
 *
 * No secrets/server-only code here — imported from both client components
 * (the editor) and the API route.
 */

/**
 * Deliberately NOT a free-form color picker (see docs/menu-generator.md):
 * an unconstrained picker risks the user landing on a low-contrast or
 * simply ugly combination. Each swatch here is only ever used as an accent
 * (category header backgrounds, highlights) — body text stays on a neutral
 * light background regardless of choice, so the risky pairing is contained.
 * The text color painted *on* the accent itself is never chosen by the user
 * — it's computed from the swatch via src/lib/utils/color-contrast.ts,
 * guaranteeing a readable pairing no matter which swatch is picked.
 */
export const CURATED_ACCENT_COLORS = [
  { id: "sunset-orange", label: "Захід сонця", hex: "#E8590C" },
  { id: "forest-green", label: "Лісова зелень", hex: "#2F9E44" },
  { id: "ocean-blue", label: "Океан", hex: "#1971C2" },
  { id: "royal-purple", label: "Королівський фіолетовий", hex: "#7048E8" },
  { id: "rose-red", label: "Рожево-червоний", hex: "#E64980" },
  { id: "golden-amber", label: "Бурштиновий", hex: "#F08C00" },
  { id: "teal", label: "Смарагдовий", hex: "#0C8599" },
  { id: "charcoal", label: "Графітовий", hex: "#343A40" },
] as const;

export type AccentColorId = (typeof CURATED_ACCENT_COLORS)[number]["id"];

/**
 * All 7 confirmed to ship a `cyrillic` subset in next/font's Google Fonts
 * data (verified directly against next/dist/compiled/@next/font's
 * font-data.json before picking this list — Playfair Display in particular
 * is easy to assume Latin-only, but does support Cyrillic).
 */
export const CURATED_FONTS = [
  { id: "inter", label: "Inter" },
  { id: "manrope", label: "Manrope" },
  { id: "pt-sans", label: "PT Sans" },
  { id: "rubik", label: "Rubik" },
  { id: "montserrat", label: "Montserrat" },
  { id: "playfair-display", label: "Playfair Display" },
  { id: "oswald", label: "Oswald" },
] as const;

export type FontId = (typeof CURATED_FONTS)[number]["id"];

export const LAYOUT_COLUMN_OPTIONS = [1, 2, 3] as const;
export type LayoutColumns = (typeof LAYOUT_COLUMN_OPTIONS)[number];

export function isAccentColorId(value: string): value is AccentColorId {
  return CURATED_ACCENT_COLORS.some((color) => color.id === value);
}

export function isFontId(value: string): value is FontId {
  return CURATED_FONTS.some((font) => font.id === value);
}

export function getAccentColorHex(id: AccentColorId): string {
  return CURATED_ACCENT_COLORS.find((color) => color.id === id)!.hex;
}
