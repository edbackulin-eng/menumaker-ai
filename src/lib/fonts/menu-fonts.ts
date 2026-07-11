import { Manrope, Montserrat, Oswald, Playfair_Display, PT_Sans, Rubik } from "next/font/google";

import type { FontId } from "@/config/menu-style";

/**
 * `Inter` is already loaded app-wide with `--font-inter` in the root layout
 * (src/app/layout.tsx) — reused here rather than re-instantiated (next/font
 * dedupes at the module level, but referencing an already-global CSS
 * variable is simpler and avoids loading Inter twice).
 *
 * Every other curated font (src/config/menu-style.ts) is instantiated once,
 * at module scope, as next/font requires — all 6 are loaded together so
 * switching the live preview's font is an instant CSS variable swap with no
 * further network requests, not a re-fetch per selection.
 */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});
const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "700"],
  display: "swap",
});
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

/** Apply to a wrapper element so every curated font's CSS variable is available underneath it. */
export const MENU_EDITOR_FONT_VARIABLES_CLASSNAME = [
  manrope.variable,
  ptSans.variable,
  rubik.variable,
  montserrat.variable,
  playfairDisplay.variable,
  oswald.variable,
].join(" ");

export const FONT_ID_TO_CSS_VARIABLE: Record<FontId, string> = {
  inter: "var(--font-inter)",
  manrope: "var(--font-manrope)",
  "pt-sans": "var(--font-pt-sans)",
  rubik: "var(--font-rubik)",
  montserrat: "var(--font-montserrat)",
  "playfair-display": "var(--font-playfair-display)",
  oswald: "var(--font-oswald)",
};
