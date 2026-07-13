import "server-only";
import sharp from "sharp";

import type { TemplateBackground } from "@/lib/utils/resolve-menu-style";

/**
 * @react-pdf/renderer has no CSS `linear-gradient`/`background-image`
 * support (verified directly before choosing this approach — its styling
 * system only accepts a solid `backgroundColor`) — but it does have an
 * `ImageBackground` component that accepts a base64 data URI. Rather than
 * shipping a separate pre-rendered PNG per template (a second asset
 * pipeline to keep in sync with the same gradient defined in `config`),
 * this renders the *same* `{type, colors, angleDeg}` descriptor DOM/Satori
 * already consume into a tiny inline SVG — one source of truth for the
 * gradient shape across all three renderers.
 *
 * The SVG itself is then rasterized to PNG via `sharp` before being
 * base64-encoded: @react-pdf/renderer's underlying image decoder
 * (`@react-pdf/pdfkit`, wrapping PDFKit) only understands JPEG/PNG raster
 * bytes, not SVG — passing an `image/svg+xml` data URI directly reproduced
 * a crash (`fs.readFileSync` receiving a non-string "path", from PDFKit's
 * source-type sniffing falling through to its filesystem-path branch for a
 * mime type it doesn't recognize). `sharp` was already a resolved
 * transitive dependency of Next.js's own image pipeline; added directly
 * here since this module now imports it itself.
 *
 * Radial gradients are deliberately unsupported here (see
 * resolveTemplateDefaults's doc comment) — `background.type` is expected
 * to already be constrained to `"solid" | "linear-gradient"` by the time a
 * template reaches PDF export; call sites should treat `"radial-gradient"`
 * as "render the accent-tinted neutral fallback instead" rather than call
 * this function with it.
 */
export async function linearGradientToDataUri(
  background: TemplateBackground,
  width: number,
  height: number,
): Promise<string> {
  const stopCount = background.colors.length;
  const stops = background.colors
    .map((color, index) => {
      const offset = stopCount === 1 ? 0 : (index / (stopCount - 1)) * 100;
      return `<stop offset="${offset}%" stop-color="${color}" />`;
    })
    .join("");

  // Approximates `angleDeg` as one of the 4 diagonal/axis directions
  // closest to it — react-pdf's Image has no rotate-then-crop primitive to
  // reproduce an arbitrary CSS angle exactly, and for a full-bleed page
  // background the difference is not perceptible.
  const angle = background.angleDeg ?? 135;
  const [x1, y1, x2, y2] =
    angle % 180 < 90 ? ["0%", "0%", "100%", "100%"] : ["100%", "0%", "0%", "100%"];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)" /></svg>`;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}
