/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- Satori
   rasterises this tree straight to PNG bytes. Nothing here ever becomes a
   DOM node, so next/image optimisation and alt text do not apply. */
import "server-only";
import { ImageResponse } from "next/og";

import { isDietaryBadge } from "@/components/menu-render/grid/grid-dish-card";
import { parseGridPalette, type GridPalette } from "@/components/menu-render/grid/grid-palette";
import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { loadPngFontBuffers } from "@/lib/export/fonts";
import { chunkIntoRows, GRID_EXPORT_COLUMNS } from "@/lib/export/grid/grid-rows";
import { getDishPlaceholderColor } from "@/lib/utils/dish-photo-placeholder";
import { dishPhotoUrlForEngine } from "@/lib/utils/dish-photo-url";
import type { MenuItem } from "@/services/ai/schemas/menu-content";
import type { ExportableMenu } from "@/services/export/load-menu";

const CANVAS_WIDTH = 1200;
const MIN_HEIGHT = 900;
const MAX_HEIGHT = 20000;
const BODY_FONT = "GridBody";
const HEADING_FONT = "GridHeading";

const PAGE_PADDING = 44;
const GUTTER = 20;
const CARD_WIDTH = (CANVAS_WIDTH - PAGE_PADDING * 2 - GUTTER * (GRID_EXPORT_COLUMNS - 1)) / 3;
/** 4:3, matching the DOM card's aspect-ratio exactly. */
const PHOTO_HEIGHT = Math.round((CARD_WIDTH * 3) / 4);

const HEADER_HEIGHT = 150;
const FOOTER_HEIGHT = 96;
const VERTICAL_PADDING = 64;
/** Category heading + accent rule + the gap before its first row. */
const CATEGORY_BLOCK_HEIGHT = 96;
/** Photo + the text block beneath it (name, two description lines, a badge row) + the gap to the next row. */
const CARD_TEXT_HEIGHT = 132;
const ROW_HEIGHT = PHOTO_HEIGHT + CARD_TEXT_HEIGHT + GUTTER;

/**
 * Satori has no intrinsic sizing — the canvas height is declared upfront
 * and anything past it is cropped silently, with no error anywhere. (That
 * is not hypothetical: the Modern renderer shipped with an averaging
 * estimate that dropped an entire category off the bottom of the export.)
 *
 * A grid is far easier to measure than Modern's uneven columns, because
 * every row is the same height by construction: one photo of fixed aspect
 * plus a text block. So this counts rows, not items — `ceil(items / 3)` per
 * category — and every constant is deliberately generous. Trailing empty
 * background costs nothing; a cropped dish is a broken menu.
 */
function estimateHeight(menu: ExportableMenu): number {
  const body = menu.content.categories.reduce((sum, category) => {
    const rows = Math.ceil(category.items.length / GRID_EXPORT_COLUMNS);
    return sum + CATEGORY_BLOCK_HEIGHT + rows * ROW_HEIGHT;
  }, 0);
  const total = HEADER_HEIGHT + VERTICAL_PADDING + body + FOOTER_HEIGHT;
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, total));
}

function dishCard(
  item: MenuItem,
  categoryName: string,
  currency: string | undefined,
  showBadges: boolean,
  palette: GridPalette,
) {
  const badges = showBadges ? (item.badges ?? []) : [];
  return (
    <div
      key={item.id}
      style={{
        display: "flex",
        flexDirection: "column",
        width: CARD_WIDTH,
        backgroundColor: palette.card,
        border: `1px solid ${palette.cardBorder}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {item.photoUrl ? (
        // Satori fetches remote images itself, so this path passes the URL
        // straight through — unlike the PDF path, which must embed bytes.
        <img
          src={dishPhotoUrlForEngine(item.photoUrl, "grid")}
          width={CARD_WIDTH}
          height={PHOTO_HEIGHT}
          style={{ width: CARD_WIDTH, height: PHOTO_HEIGHT, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: CARD_WIDTH,
            height: PHOTO_HEIGHT,
            backgroundColor: getDishPlaceholderColor(categoryName),
          }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 21, color: palette.text }}>{item.name}</div>
          {item.price !== undefined && (
            <div
              style={{
                display: "flex",
                fontFamily: HEADING_FONT,
                fontSize: 21,
                color: palette.accent,
              }}
            >
              {item.price}
              {currency ? ` ${currency}` : ""}
            </div>
          )}
        </div>
        {item.description && (
          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: palette.textMuted,
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            {item.description}
          </div>
        )}
        {badges.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {badges.map((badge) => {
              const dietary = isDietaryBadge(badge);
              return (
                <div
                  key={badge}
                  style={{
                    display: "flex",
                    fontSize: 13,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: 4,
                    color: dietary ? palette.badgeVeg : palette.accent,
                    border: `1px solid ${dietary ? palette.badgeVegBorder : palette.accentBorder}`,
                  }}
                >
                  {badge}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Satori tree for the `grid` engine — same data and proportions as the DOM
 * renderer, scaled to a 1200px canvas, in the flexbox-only inline-style
 * subset Satori understands (no Tailwind, no CSS variables, and notably no
 * CSS Grid, which is why the rows are built explicitly here).
 */
export async function renderGridPng(menu: ExportableMenu): Promise<Buffer> {
  const [bodyFonts, headingFonts] = await Promise.all([
    loadPngFontBuffers(menu.style.fontId),
    loadPngFontBuffers(menu.style.headingFontId),
  ]);

  const palette = parseGridPalette(menu.style.palette);
  const venue = menu.content.venue;
  const currency = resolveCurrencyDisplay(menu.content.currency);
  const heading = venue?.name ?? menu.title;
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");
  const height = estimateHeight(menu);

  const element = (
    <div
      style={{
        width: CANVAS_WIDTH,
        height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: palette.page,
        fontFamily: BODY_FONT,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: HEADER_HEIGHT,
        }}
      >
        {venue?.tagline && (
          <div
            style={{
              display: "flex",
              fontSize: 17,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: palette.accent,
              marginBottom: 10,
            }}
          >
            {venue.tagline}
          </div>
        )}
        <div
          style={{ display: "flex", fontFamily: HEADING_FONT, fontSize: 52, color: palette.text }}
        >
          {heading}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: `24px ${PAGE_PADDING}px 32px`,
        }}
      >
        {menu.content.categories.map((category) => (
          <div
            key={category.id}
            style={{ display: "flex", flexDirection: "column", marginBottom: 30 }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: HEADING_FONT,
                fontSize: 32,
                color: palette.text,
              }}
            >
              {category.name}
            </div>
            <div
              style={{
                display: "flex",
                width: 48,
                height: 3,
                backgroundColor: palette.accent,
                marginTop: 8,
                marginBottom: 18,
              }}
            />
            {chunkIntoRows(category.items).map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: "flex", gap: GUTTER, marginBottom: GUTTER }}>
                {row.map((item) =>
                  dishCard(item, category.name, currency, menu.style.showBadges, palette),
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {contactLine && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: palette.footer,
            borderTop: `1px solid ${palette.footerBorder}`,
            padding: `26px ${PAGE_PADDING}px`,
          }}
        >
          <div style={{ display: "flex", fontSize: 19, color: palette.footerText }}>
            {contactLine}
          </div>
        </div>
      )}
    </div>
  );

  const response = new ImageResponse(element, {
    width: CANVAS_WIDTH,
    height,
    fonts: [
      { name: BODY_FONT, data: bodyFonts.cyrillic, weight: 400, style: "normal" },
      { name: BODY_FONT, data: bodyFonts.latin, weight: 400, style: "normal" },
      { name: HEADING_FONT, data: headingFonts.cyrillic, weight: 400, style: "normal" },
      { name: HEADING_FONT, data: headingFonts.latin, weight: 400, style: "normal" },
    ],
  });

  return Buffer.from(await response.arrayBuffer());
}
