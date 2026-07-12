import "server-only";
import { ImageResponse } from "next/og";

import { getAccentColorHex } from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
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
 * source and same style-resolution logic (accent/font/columns), different
 * rendering primitives out of necessity — see docs/menu-export.md for the
 * full reasoning (also covers the PDF path, which has the same split).
 */
export async function renderMenuPng(menu: ExportableMenu): Promise<Buffer> {
  const accentHex = getAccentColorHex(menu.style.accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);
  const columnGroups = distributeIntoColumns(menu.content.categories, menu.style.columns);
  const fontBuffers = await loadPngFontBuffers(menu.style.fontId);
  const fontFamily = "MenuFont";
  const height = estimateCanvasHeight(menu);

  const element = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: EXPORT_TOKENS.background,
        padding: 48,
        fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 42,
          fontWeight: 700,
          color: EXPORT_TOKENS.foreground,
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
                  backgroundColor: EXPORT_TOKENS.surface,
                  borderRadius: 8,
                  border: `1px solid ${EXPORT_TOKENS.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    backgroundColor: accentHex,
                    color: accentTextHex,
                    padding: "10px 16px",
                    fontSize: 22,
                    fontWeight: 700,
                    borderRadius: "8px 8px 0 0",
                  }}
                >
                  {category.name}
                </div>
                <div style={{ display: "flex", flexDirection: "column", padding: "4px 16px" }}>
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        borderBottom: `1px solid ${EXPORT_TOKENS.border}`,
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
                            color: EXPORT_TOKENS.foreground,
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
                              color: EXPORT_TOKENS.foreground,
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
                            color: EXPORT_TOKENS.foregroundSecondary,
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
      { name: fontFamily, data: fontBuffers.cyrillic, weight: 400, style: "normal" },
      { name: fontFamily, data: fontBuffers.latin, weight: 400, style: "normal" },
    ],
  });

  return Buffer.from(await response.arrayBuffer());
}
