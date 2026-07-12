import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { FontId } from "@/config/menu-style";

/**
 * Neither export renderer can use next/font's self-hosted files directly
 * (those live under a build-hashed `.next/static/media/` path with no
 * stable reference, and next/font only produces browser-consumable
 * `@font-face` CSS anyway) — these are separately sourced, repo-committed
 * font binaries specifically for server-side rendering. Two different sets
 * because the two renderers have genuinely different constraints:
 *
 * - PDF (@react-pdf/renderer, via fontkit): handles a single full-coverage
 *   file fine (verified directly — Cyrillic + Latin + digits + currency
 *   symbols all in one TTF sourced from the google/fonts repo, the same
 *   origin next/font itself draws from).
 * - PNG (next/og's ImageResponse, via Satori): fontkit's variable-font
 *   (`fvar` table) parsing crashes inside Satori specifically (reproduced
 *   directly before choosing this path) — Satori needs static-weight
 *   files, which the current google/fonts repo no longer ships for most of
 *   these families (variable-only). Split per-subset static files from
 *   @fontsource fill that gap; Satori supports registering multiple font
 *   buffers under one family as glyph-coverage fallbacks (also verified
 *   directly — mixed Cyrillic+Latin text renders correctly across two
 *   files), which a single subset alone can't cover.
 */
const PDF_FONT_FILENAME: Record<FontId, string> = {
  inter: "inter.ttf",
  manrope: "manrope.ttf",
  "pt-sans": "pt-sans.ttf",
  rubik: "rubik.ttf",
  montserrat: "montserrat.ttf",
  "playfair-display": "playfair-display.ttf",
  oswald: "oswald.ttf",
};

/** @react-pdf/renderer's Font.register `src` is a path/URL string, not a buffer — it reads the file itself. */
export function getPdfFontPath(fontId: FontId): string {
  return join(process.cwd(), "src/assets/fonts/pdf", PDF_FONT_FILENAME[fontId]);
}

export interface PngFontBuffers {
  cyrillic: Buffer;
  latin: Buffer;
}

export async function loadPngFontBuffers(fontId: FontId): Promise<PngFontBuffers> {
  const base = join(process.cwd(), "src/assets/fonts/png");
  const [cyrillic, latin] = await Promise.all([
    readFile(join(base, `${fontId}-cyrillic.woff`)),
    readFile(join(base, `${fontId}-latin.woff`)),
  ]);
  return { cyrillic, latin };
}
