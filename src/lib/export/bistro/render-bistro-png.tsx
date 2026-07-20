import "server-only";
import { ImageResponse } from "next/og";

import {
  parseBistroPalette,
  type BistroPalette,
} from "@/components/menu-render/bistro/bistro-palette";
import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { distributeSequentially } from "@/lib/export/design-tokens";
import { loadPngFontBuffers } from "@/lib/export/fonts";
import type { MenuCategory } from "@/services/ai/schemas/menu-content";
import type { ExportableMenu } from "@/services/export/load-menu";

const CANVAS_WIDTH = 1000;
const MIN_HEIGHT = 800;
const MAX_HEIGHT = 20000;
const BODY_FONT = "BistroBody";
const HEADING_FONT = "BistroHeading";

const PAGE_PADDING = 64;
const COLUMN_GAP = 56;
const COLUMN_COUNT = 2;

const HEADER_HEIGHT = 180;
const FOOTER_HEIGHT = 70;
const VERTICAL_PADDING = 80;
/** Category heading + gold rule + the category's own bottom margin. */
const CATEGORY_BLOCK_HEIGHT = 104;
/**
 * One dish, budgeted for the *worst* case — a name line plus a description
 * that wraps to two lines plus the row's bottom margin (~102px measured).
 * An earlier value of 74 assumed a single description line and let the
 * footer overlap the last dish of the taller column, exactly the Satori
 * silent-overflow the height estimate exists to prevent. Over-budgeting a
 * short menu costs a little trailing paper; under-budgeting a long one
 * collides content.
 */
const DISH_ROW_HEIGHT = 102;

/**
 * Satori has no intrinsic sizing — the canvas height is declared upfront and
 * anything past it is silently cropped. So this measures the *taller* of the
 * two columns (not an average), the same lesson the Modern renderer's
 * height estimate learned the hard way: an uneven split under-measured and
 * dropped a whole category off the bottom with no error. Bistro has no
 * photos, so its rows are short and this over-estimates comfortably —
 * trailing paper costs nothing, a cropped dish is a broken menu.
 */
function estimateHeight(menu: ExportableMenu): number {
  const columns = distributeSequentially(menu.content.categories, COLUMN_COUNT);
  const columnHeight = (categories: MenuCategory[]) =>
    categories.reduce(
      (sum, category) => sum + CATEGORY_BLOCK_HEIGHT + category.items.length * DISH_ROW_HEIGHT,
      0,
    );
  const tallest = Math.max(...columns.map(columnHeight), 0);
  const total = HEADER_HEIGHT + VERTICAL_PADDING + tallest + FOOTER_HEIGHT;
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, total));
}

function category(cat: MenuCategory, currency: string | undefined, palette: BistroPalette) {
  return (
    <div key={cat.id} style={{ display: "flex", flexDirection: "column", marginBottom: 34 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          fontFamily: HEADING_FONT,
          fontSize: 30,
          color: palette.text,
        }}
      >
        {cat.name}
      </div>
      <div
        style={{
          display: "flex",
          alignSelf: "center",
          width: 46,
          height: 1,
          backgroundColor: palette.accent,
          marginTop: 6,
          marginBottom: 20,
        }}
      />
      {cat.items.map((item) => (
        <div key={item.id} style={{ display: "flex", flexDirection: "column", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", fontSize: 23, color: palette.text }}>{item.name}</div>
            <div
              style={{
                display: "flex",
                flexGrow: 1,
                height: 14,
                // Satori supports only solid/dashed borders (not dotted) —
                // see the DOM renderer's matching note. Dashed here keeps
                // the PNG identical to the web/PDF leader.
                borderBottom: `1px dashed ${palette.accent}`,
              }}
            />
            {item.price !== undefined && (
              <div
                style={{
                  display: "flex",
                  fontFamily: HEADING_FONT,
                  fontSize: 23,
                  color: palette.accent,
                }}
              >
                {item.price}
                {currency ? ` ${currency}` : ""}
              </div>
            )}
          </div>
          {item.description && (
            // Not italic — the fonts ship only a regular face; see the DOM
            // renderer's note. Muted color carries the distinction instead.
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: palette.textMuted,
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              {item.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Satori tree for the `classic-elegant` (Bistro) engine — text-only,
 * serif, dotted leaders. No `<img>` anywhere, on purpose: this engine
 * renders no dish photos in any of its three surfaces.
 *
 * Two explicit columns from distributeSequentially, matching the DOM
 * renderer's CSS multi-column newspaper fill (Satori supports neither
 * multi-column nor break-inside), so Web/PDF/PNG agree on order.
 */
export async function renderBistroPng(menu: ExportableMenu): Promise<Buffer> {
  const [bodyFonts, headingFonts] = await Promise.all([
    loadPngFontBuffers(menu.style.fontId),
    loadPngFontBuffers(menu.style.headingFontId),
  ]);

  const palette = parseBistroPalette(menu.style.palette);
  const venue = menu.content.venue;
  const currency = resolveCurrencyDisplay(menu.content.currency);
  const heading = venue?.name ?? menu.title;
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");
  const [left = [], right = []] = distributeSequentially(menu.content.categories, COLUMN_COUNT);
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
        padding: `40px ${PAGE_PADDING}px 30px`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: HEADER_HEIGHT,
          borderTop: `1px solid ${palette.rule}`,
          borderBottom: `1px solid ${palette.rule}`,
        }}
      >
        {venue?.tagline && (
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 7,
              textTransform: "uppercase",
              color: palette.accent,
              marginBottom: 14,
            }}
          >
            {venue.tagline}
          </div>
        )}
        <div
          style={{ display: "flex", fontFamily: HEADING_FONT, fontSize: 54, color: palette.text }}
        >
          {heading}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, gap: COLUMN_GAP, paddingTop: 40 }}>
        {[left, right].map((group, index) => (
          <div key={index} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {group.map((cat) => category(cat, currency, palette))}
          </div>
        ))}
      </div>

      {contactLine && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 18,
            borderTop: `1px solid ${palette.footerRule}`,
            fontSize: 19,
            color: palette.footerText,
          }}
        >
          {contactLine}
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
