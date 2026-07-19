/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- Satori
   rasterises this tree straight to PNG bytes. Nothing here ever becomes a
   DOM node, so next/image optimisation and alt text do not apply. */
import "server-only";
import { ImageResponse } from "next/og";

import { MODERN_PALETTE } from "@/components/menu-render/modern/modern-palette";
import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { distributeSequentially } from "@/lib/export/design-tokens";
import { loadPngFontBuffers } from "@/lib/export/fonts";
import { getDishPlaceholderColor } from "@/lib/utils/dish-photo-placeholder";
import { dishPhotoUrlForEngine } from "@/lib/utils/dish-photo-url";
import type { MenuItem } from "@/services/ai/schemas/menu-content";
import type { ExportableMenu } from "@/services/export/load-menu";

const CANVAS_WIDTH = 1200;
const MIN_HEIGHT = 900;
const MAX_HEIGHT = 20000;
const BODY_FONT = "ModernBody";
const HEADING_FONT = "ModernHeading";

const PAGE_PADDING = 52;
const COLUMN_GAP = 52;

const BANNER_HEIGHT = 264;
const FOOTER_HEIGHT = 90;
const VERTICAL_PADDING = 88;
/** Category heading + gold rule + the gap to the next category. */
const CATEGORY_BLOCK_HEIGHT = 130;
/** One dish row: the 110px photo floors it, but a two-line description plus a badge runs taller. */
const DISH_ROW_HEIGHT = 155;

/**
 * Satori has no intrinsic sizing — the canvas height must be declared
 * upfront, and anything past it is silently cropped rather than flowing
 * onto another page the way the PDF does.
 *
 * So this measures the *taller of the two columns*, not an average. An
 * earlier version averaged across both, which under-measured whenever the
 * two columns were uneven: a three-category menu put two categories in the
 * left column, the estimate came out 500px short, and an entire category
 * was cropped off the bottom of the export with no error anywhere. Every
 * constant here is deliberately generous — trailing dark background costs
 * nothing, a missing dish is a broken menu.
 */
function estimateHeight(menu: ExportableMenu): number {
  const columns = distributeSequentially(menu.content.categories, 2);
  const columnHeight = (categories: (typeof columns)[number]) =>
    categories.reduce(
      (sum, category) => sum + CATEGORY_BLOCK_HEIGHT + category.items.length * DISH_ROW_HEIGHT,
      0,
    );
  const tallest = Math.max(...columns.map(columnHeight), 0);
  const total = BANNER_HEIGHT + VERTICAL_PADDING + tallest + FOOTER_HEIGHT;
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, total));
}

const DIETARY = new Set(["vegetarian", "vegan", "gluten-free", "gluten free"]);

function badgeColors(badge: string) {
  const dietary = DIETARY.has(badge.trim().toLowerCase());
  return {
    color: dietary ? MODERN_PALETTE.badgeVeg : MODERN_PALETTE.gold,
    border: `1px solid ${dietary ? MODERN_PALETTE.badgeVegBorder : MODERN_PALETTE.badgeGoldBorder}`,
  };
}

function dishRow(
  item: MenuItem,
  categoryName: string,
  currency: string | undefined,
  showBadges: boolean,
) {
  const badges = showBadges ? (item.badges ?? []) : [];
  return (
    <div key={item.id} style={{ display: "flex", gap: 18, marginBottom: 26 }}>
      {item.photoUrl ? (
        // Satori fetches remote images itself, so the PNG path passes URLs
        // straight through — unlike the PDF path, which has to embed bytes.
        <img
          src={dishPhotoUrlForEngine(item.photoUrl, "banner-two-column")}
          width={110}
          height={110}
          style={{ width: 110, height: 110, borderRadius: 14, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 14,
            backgroundColor: getDishPlaceholderColor(categoryName),
          }}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 26, color: MODERN_PALETTE.text }}>
            {item.name}
          </div>
          {item.price !== undefined && (
            <div
              style={{
                display: "flex",
                fontFamily: HEADING_FONT,
                fontSize: 28,
                color: MODERN_PALETTE.gold,
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
              fontSize: 20,
              color: MODERN_PALETTE.textMuted,
              marginTop: 7,
              lineHeight: 1.45,
            }}
          >
            {item.description}
          </div>
        )}
        {badges.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
            {badges.map((badge) => (
              <div
                key={badge}
                style={{
                  display: "flex",
                  fontSize: 16,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 5,
                  ...badgeColors(badge),
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Satori tree for the `banner-two-column` engine — same data and same
 * proportions as the DOM renderer, scaled to a 1200px canvas, expressed in
 * the flexbox-only inline-style subset Satori understands (no Tailwind, no
 * CSS variables, no multi-column).
 *
 * Column order comes from distributeSequentially so the two halves match
 * the browser's newspaper-order multi-column fill, which is what makes
 * Web/PDF/PNG line up.
 */
export async function renderModernPng(menu: ExportableMenu): Promise<Buffer> {
  const [bodyFonts, headingFonts] = await Promise.all([
    loadPngFontBuffers(menu.style.fontId),
    loadPngFontBuffers(menu.style.headingFontId),
  ]);

  const venue = menu.content.venue;
  const currency = resolveCurrencyDisplay(menu.content.currency);
  const [left = [], right = []] = distributeSequentially(menu.content.categories, 2);
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");

  const column = (categories: typeof left) => (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {categories.map((category) => (
        <div
          key={category.id}
          style={{ display: "flex", flexDirection: "column", marginBottom: 40 }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: HEADING_FONT,
              fontSize: 38,
              color: MODERN_PALETTE.text,
            }}
          >
            {category.name}
          </div>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 4,
              backgroundColor: MODERN_PALETTE.gold,
              marginTop: 12,
              marginBottom: 26,
            }}
          />
          {category.items.map((item) =>
            dishRow(item, category.name, currency, menu.style.showBadges),
          )}
        </div>
      ))}
    </div>
  );

  const element = (
    <div
      style={{
        width: CANVAS_WIDTH,
        height: estimateHeight(menu),
        display: "flex",
        flexDirection: "column",
        backgroundColor: MODERN_PALETTE.page,
        fontFamily: BODY_FONT,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 264,
          backgroundColor: MODERN_PALETTE.banner,
          borderBottom: `2px solid ${MODERN_PALETTE.bannerBorder}`,
        }}
      >
        {venue?.tagline && (
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 8,
              color: MODERN_PALETTE.gold,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {venue.tagline}
          </div>
        )}
        <div
          style={{
            display: "flex",
            fontFamily: HEADING_FONT,
            fontSize: 76,
            color: MODERN_PALETTE.text,
          }}
        >
          {venue?.name ?? menu.title}
        </div>
        <div
          style={{
            display: "flex",
            width: 104,
            height: 2,
            backgroundColor: MODERN_PALETTE.gold,
            marginTop: 20,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          gap: COLUMN_GAP,
          padding: `48px ${PAGE_PADDING}px 40px`,
        }}
      >
        {column(left)}
        {column(right)}
      </div>

      {contactLine && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: MODERN_PALETTE.footer,
            borderTop: `2px solid ${MODERN_PALETTE.footerBorder}`,
            padding: `24px ${PAGE_PADDING}px`,
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: MODERN_PALETTE.footerText }}>
            {contactLine}
          </div>
        </div>
      )}
    </div>
  );

  const response = new ImageResponse(element, {
    width: CANVAS_WIDTH,
    height: estimateHeight(menu),
    fonts: [
      { name: BODY_FONT, data: bodyFonts.cyrillic, weight: 400, style: "normal" },
      { name: BODY_FONT, data: bodyFonts.latin, weight: 400, style: "normal" },
      { name: HEADING_FONT, data: headingFonts.cyrillic, weight: 400, style: "normal" },
      { name: HEADING_FONT, data: headingFonts.latin, weight: 400, style: "normal" },
    ],
  });

  return Buffer.from(await response.arrayBuffer());
}
