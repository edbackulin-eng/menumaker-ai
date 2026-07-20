/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- Satori
   rasterises this tree straight to PNG bytes. Nothing here ever becomes a
   DOM node, so next/image optimisation and alt text do not apply. */
import "server-only";
import { ImageResponse } from "next/og";

import {
  categoryHeroPhotoUrl,
  parseEditorialPalette,
  type EditorialPalette,
} from "@/components/menu-render/editorial/editorial-palette";
import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { loadPngFontBuffers } from "@/lib/export/fonts";
import { dishPhotoUrlForEngine } from "@/lib/utils/dish-photo-url";
import type { MenuCategory } from "@/services/ai/schemas/menu-content";
import type { ExportableMenu } from "@/services/export/load-menu";

const CANVAS_WIDTH = 1000;
const MIN_HEIGHT = 900;
const MAX_HEIGHT = 20000;
const BODY_FONT = "EditorialBody";
const HEADING_FONT = "EditorialHeading";

const PAGE_PADDING = 56;
const HERO_HEIGHT = 380;

const MASTHEAD_HEIGHT = 190;
const FOOTER_HEIGHT = 80;
const VERTICAL_PADDING = 80;
/** Hero band + category heading + accent rule + the section's bottom margin. */
const CATEGORY_HEADER_HEIGHT = HERO_HEIGHT + 130;
/** One dish: display name + a two-line description + the row's padding and rule (~118px worst case). */
const DISH_ROW_HEIGHT = 118;

/**
 * Satori has no intrinsic sizing — the canvas height is declared upfront
 * and content past it is silently cropped. This engine is a single column,
 * so unlike Modern/Bistro there's no taller-of-two-columns to weigh: it's a
 * straight sum. Every constant is budgeted for the worst case (a two-line
 * description, a category with a hero band); over-budgeting costs trailing
 * background, under-budgeting collides the footer into the last dish.
 */
function estimateHeight(menu: ExportableMenu): number {
  const body = menu.content.categories.reduce(
    (sum, category) => sum + CATEGORY_HEADER_HEIGHT + category.items.length * DISH_ROW_HEIGHT,
    0,
  );
  const total = MASTHEAD_HEIGHT + VERTICAL_PADDING + body + FOOTER_HEIGHT;
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, total));
}

function category(cat: MenuCategory, currency: string | undefined, palette: EditorialPalette) {
  const hero = categoryHeroPhotoUrl(cat.items);
  return (
    <div key={cat.id} style={{ display: "flex", flexDirection: "column", marginBottom: 50 }}>
      {hero ? (
        <img
          src={dishPhotoUrlForEngine(hero, "editorial")}
          width={CANVAS_WIDTH - PAGE_PADDING * 2}
          height={HERO_HEIGHT}
          style={{
            width: CANVAS_WIDTH - PAGE_PADDING * 2,
            height: HERO_HEIGHT,
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: CANVAS_WIDTH - PAGE_PADDING * 2,
            height: HERO_HEIGHT,
            backgroundColor: palette.heroPlaceholder,
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          fontFamily: HEADING_FONT,
          fontSize: 44,
          color: palette.text,
          marginTop: 24,
        }}
      >
        {cat.name}
      </div>
      <div
        style={{
          display: "flex",
          width: 60,
          height: 3,
          backgroundColor: palette.accent,
          marginTop: 8,
          marginBottom: 6,
        }}
      />
      {cat.items.map((item, index) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 24,
            padding: "18px 0",
            borderBottom: index === cat.items.length - 1 ? "none" : `1px solid ${palette.rule}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                display: "flex",
                fontFamily: HEADING_FONT,
                fontSize: 26,
                color: palette.text,
              }}
            >
              {item.name}
            </div>
            {item.description && (
              <div
                style={{
                  display: "flex",
                  fontSize: 19,
                  color: palette.textMuted,
                  marginTop: 6,
                  lineHeight: 1.45,
                }}
              >
                {item.description}
              </div>
            )}
          </div>
          {item.price !== undefined && (
            <div
              style={{
                display: "flex",
                fontFamily: HEADING_FONT,
                fontSize: 24,
                color: palette.accent,
              }}
            >
              {item.price}
              {currency ? ` ${currency}` : ""}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Satori tree for the `editorial` engine — a single-column magazine spread
 * with a full-width hero photo per category. Satori fetches remote images
 * itself, so the hero passes a URL straight through (unlike the PDF path,
 * which embeds bytes).
 *
 * Single column means no distributeSequentially: category order is just
 * top-to-bottom, identical to the DOM and PDF trees.
 */
export async function renderEditorialPng(menu: ExportableMenu): Promise<Buffer> {
  const [bodyFonts, headingFonts] = await Promise.all([
    loadPngFontBuffers(menu.style.fontId),
    loadPngFontBuffers(menu.style.headingFontId),
  ]);

  const palette = parseEditorialPalette(menu.style.palette);
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
        padding: `44px ${PAGE_PADDING}px 32px`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 44 }}>
        {venue?.tagline && (
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: palette.accent,
              marginBottom: 14,
            }}
          >
            {venue.tagline}
          </div>
        )}
        <div
          style={{ display: "flex", fontFamily: HEADING_FONT, fontSize: 78, color: palette.text }}
        >
          {heading}
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 1,
            backgroundColor: palette.rule,
            marginTop: 24,
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {menu.content.categories.map((cat) => category(cat, currency, palette))}
      </div>

      {contactLine && (
        <div
          style={{
            display: "flex",
            paddingTop: 20,
            borderTop: `1px solid ${palette.footerRule}`,
            fontSize: 20,
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
