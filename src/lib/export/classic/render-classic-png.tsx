import "server-only";
import { ImageResponse } from "next/og";

import { getAccentColorHex } from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import {
  backgroundToCssValue,
  CORNER_RADIUS_PX,
  resolvePageForeground,
} from "@/lib/utils/resolve-menu-style";
import { distributeIntoColumns, EXPORT_TOKENS } from "@/lib/export/design-tokens";
import { loadPngFontBuffers } from "@/lib/export/fonts";
import type { ExportableMenu } from "@/services/export/load-menu";

const CANVAS_WIDTH = 1200;
const MIN_HEIGHT = 900;
// High enough that no realistic menu ever hits it — PNG has no pagination
// fallback the way PDF does, so clipping here would silently drop content
// with no way to recover it (confirmed the risk was real: a 180-item test
// menu's estimate exceeded a previously-set 4200px cap). Only guards
// against a truly pathological content size blowing up render time/memory.
const MAX_HEIGHT = 20000;

const BODY_FONT_FAMILY = "MenuBodyFont";
const HEADING_FONT_FAMILY = "MenuHeadingFont";

/** Satori needs an explicit canvas size upfront (no intrinsic content-based sizing) — approximated from category/item counts rather than measured, so it's generous rather than exact. */
function estimateCanvasHeight(menu: ExportableMenu): number {
  const columns = menu.style.columns;
  const totalItems = menu.content.categories.reduce((sum, c) => sum + c.items.length, 0);
  const categoriesPerColumn = Math.ceil(menu.content.categories.length / columns);
  const itemsPerColumn = Math.ceil(totalItems / columns);
  const estimated = 220 + categoriesPerColumn * 56 + itemsPerColumn * 68;
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, estimated));
}

/**
 * Not the same JSX as MenuStaticView — Satori only understands a
 * constrained flexbox-only subset of CSS with inline styles, no Tailwind
 * classes, no CSS custom properties, no multi-column layout. Same data
 * source and same style-resolution logic (accent/font/columns/background/
 * category-header treatment), different rendering primitives out of
 * necessity — see docs/menu-templates-design.md for the full reasoning
 * (also covers the PDF path, which has the same split).
 *
 * Satori's CSS support (verified directly before relying on it here) does
 * cover `linear-gradient`/`radial-gradient` backgrounds, per-corner
 * `border-radius`, `box-shadow`, `text-transform`, and `letter-spacing` —
 * so, unlike the PDF path, this renderer reproduces all 6 Stage 13 style
 * fields exactly rather than gracefully degrading any of them.
 */
export async function renderClassicPng(menu: ExportableMenu): Promise<Buffer> {
  const { style } = menu;

  const accentHex = getAccentColorHex(style.accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);
  const pageForeground = resolvePageForeground(style.background);
  const columnGroups = distributeIntoColumns(menu.content.categories, style.columns);
  const radiusPx = CORNER_RADIUS_PX[style.cornerRadius];
  const backgroundCss = backgroundToCssValue(style.background);
  const opaqueCard = !style.background;
  const height = estimateCanvasHeight(menu);

  const sameFont = style.headingFontId === style.fontId;
  const [bodyFontBuffers, headingFontBuffers] = await Promise.all([
    loadPngFontBuffers(style.fontId),
    sameFont ? Promise.resolve(null) : loadPngFontBuffers(style.headingFontId),
  ]);

  // Satori (unlike a real DOM style object) processes every key present on
  // the style object, undefined value or not — several of its internal
  // css-to-react-native property transforms call `.trim()` on the raw value
  // with no null guard, so a literal `undefined` here throws instead of
  // being treated as "unset" (reproduced directly: this is what
  // `boxShadow`/`backgroundColor`/`letterSpacing` below guard against via
  // conditional spread rather than a ternary-to-undefined).
  const headingTextStyle: React.CSSProperties = {
    display: "flex",
    fontFamily: HEADING_FONT_FAMILY,
    fontSize: 22,
    fontWeight: 700,
    textTransform: style.categoryNameTransform === "uppercase" ? "uppercase" : "none",
    ...(style.categoryNameTransform === "uppercase" ? { letterSpacing: "0.05em" } : {}),
  };

  const element = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: EXPORT_TOKENS.background,
        padding: 48,
        fontFamily: BODY_FONT_FAMILY,
        ...backgroundCss,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: HEADING_FONT_FAMILY,
          fontSize: 42,
          fontWeight: 700,
          color: pageForeground.primary,
          marginBottom: 32,
        }}
      >
        {menu.title}
      </div>
      <div style={{ display: "flex", flexDirection: "row", gap: 24, flex: 1 }}>
        {columnGroups.map((categories, columnIndex) => (
          <div
            key={columnIndex}
            style={{ display: "flex", flexDirection: "column", flex: 1, gap: 16 }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: opaqueCard ? EXPORT_TOKENS.surface : "transparent",
                  borderRadius: radiusPx,
                  border: `1px solid ${opaqueCard ? EXPORT_TOKENS.border : pageForeground.divider}`,
                  ...(style.cardShadow ? { boxShadow: "0 4px 16px rgba(0,0,0,0.12)" } : {}),
                }}
              >
                {style.categoryHeaderStyle === "solid-bar" && (
                  <div
                    style={{
                      display: "flex",
                      backgroundColor: accentHex,
                      color: accentTextHex,
                      padding: "10px 16px",
                      borderRadius: `${radiusPx}px ${radiusPx}px 0 0`,
                    }}
                  >
                    <div style={headingTextStyle}>{category.name}</div>
                  </div>
                )}
                {style.categoryHeaderStyle === "underline" && (
                  <div
                    style={{
                      display: "flex",
                      padding: "16px 16px 10px",
                      borderBottom: `2px solid ${accentHex}`,
                    }}
                  >
                    <div style={{ ...headingTextStyle, color: accentHex }}>{category.name}</div>
                  </div>
                )}
                {style.categoryHeaderStyle === "boxed-outline" && (
                  <div style={{ display: "flex", padding: "16px 16px 8px" }}>
                    <div
                      style={{
                        display: "flex",
                        padding: "6px 14px",
                        border: `1.5px solid ${accentHex}`,
                        borderRadius: Math.max(radiusPx - 2, 0),
                      }}
                    >
                      <div style={{ ...headingTextStyle, color: accentHex }}>{category.name}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", padding: "4px 16px" }}>
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        borderBottom: `1px solid ${opaqueCard ? EXPORT_TOKENS.border : pageForeground.divider}`,
                        padding: "10px 0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            fontSize: 17,
                            fontWeight: 500,
                            color: pageForeground.primary,
                          }}
                        >
                          {item.name}
                        </div>
                        {item.price !== undefined && (
                          <div
                            style={{
                              display: "flex",
                              fontSize: 17,
                              fontWeight: 700,
                              color: pageForeground.primary,
                            }}
                          >
                            {item.price} {menu.content.currency ?? ""}
                          </div>
                        )}
                      </div>
                      {item.description && (
                        <div
                          style={{
                            display: "flex",
                            fontSize: 14,
                            color: pageForeground.secondary,
                            marginTop: 2,
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const response = new ImageResponse(element, {
    width: CANVAS_WIDTH,
    height,
    fonts: [
      { name: BODY_FONT_FAMILY, data: bodyFontBuffers.cyrillic, weight: 400, style: "normal" },
      { name: BODY_FONT_FAMILY, data: bodyFontBuffers.latin, weight: 400, style: "normal" },
      {
        name: HEADING_FONT_FAMILY,
        data: headingFontBuffers?.cyrillic ?? bodyFontBuffers.cyrillic,
        weight: 700,
        style: "normal",
      },
      {
        name: HEADING_FONT_FAMILY,
        data: headingFontBuffers?.latin ?? bodyFontBuffers.latin,
        weight: 700,
        style: "normal",
      },
    ],
  });

  return Buffer.from(await response.arrayBuffer());
}
