import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import type { MenuEngineViewProps } from "@/components/menu-render/engine-view-props";
import { GridDishCard } from "@/components/menu-render/grid/grid-dish-card";
import { parseGridPalette } from "@/components/menu-render/grid/grid-palette";

/**
 * The `grid` layout engine's DOM renderer — photo-first tiles, for venues
 * whose food is sold by the picture (burger, pizza, street food) rather
 * than by a dense typographic list.
 *
 * CSS Grid, not multi-column: Modern uses columns because its rows are
 * variable-height text and columns pack them continuously, but tiles must
 * line up in rows to read as a grid, and `grid-template-columns` with
 * `align-items: start` is the only thing that gives that. It also fixes the
 * order: CSS Grid fills row-major, which is exactly the order the PDF and
 * PNG renderers build their explicit rows in, so the three agree.
 *
 * 2 columns below 900px, 3 above. The exports are always 3 — the same
 * deliberate split Modern makes (web collapses on a phone, print does not),
 * and the item order is identical either way because both are row-major.
 */
export function GridMenuView({
  content,
  style,
  menuTitle,
  qrDataUri,
  qrLabel,
}: MenuEngineViewProps) {
  const palette = parseGridPalette(style.palette);
  const venue = content.venue;
  const currencyDisplay = resolveCurrencyDisplay(content.currency);
  const heading = venue?.name ?? menuTitle ?? "";
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");

  return (
    <div
      data-testid="grid-menu-view"
      data-layout-engine="grid"
      style={
        {
          "--menu-font": FONT_ID_TO_CSS_VARIABLE[style.fontId],
          "--menu-heading-font": FONT_ID_TO_CSS_VARIABLE[style.headingFontId],
          fontFamily: "var(--menu-font)",
          backgroundColor: palette.page,
          color: palette.text,
          overflow: "hidden",
        } as React.CSSProperties
      }
      className="rounded-lg"
    >
      {(heading || venue?.tagline) && (
        <div style={{ padding: "26px 20px 4px", textAlign: "center" }}>
          {venue?.tagline && (
            <p
              style={{
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: palette.accent,
                marginBottom: 6,
              }}
            >
              {venue.tagline}
            </p>
          )}
          {heading && (
            <h2
              style={{
                fontFamily: "var(--menu-heading-font)",
                fontSize: 30,
                fontWeight: 700,
                color: palette.text,
              }}
            >
              {heading}
            </h2>
          )}
        </div>
      )}

      <div style={{ padding: "20px 20px 24px" }}>
        {content.categories.map((category) => (
          <section key={category.id} style={{ marginBottom: 28 }}>
            <h3
              style={{
                fontFamily: "var(--menu-heading-font)",
                fontSize: 20,
                fontWeight: 700,
                color: palette.text,
              }}
            >
              {category.name}
            </h3>
            <div
              style={{
                width: 44,
                height: 3,
                backgroundColor: palette.accent,
                marginTop: 6,
                marginBottom: 14,
              }}
            />
            <div
              className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-3"
              style={{ alignItems: "start" }}
            >
              {category.items.map((item) => (
                <GridDishCard
                  key={item.id}
                  item={item}
                  categoryName={category.name}
                  currency={currencyDisplay}
                  showBadges={style.showBadges}
                  palette={palette}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {(contactLine || qrDataUri) && (
        <div
          style={{
            backgroundColor: palette.footer,
            borderTop: `1px solid ${palette.footerBorder}`,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12.5, color: palette.footerText }}>{contactLine}</span>
          {qrDataUri && (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: palette.footerText, textAlign: "end" }}>
                {qrLabel}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUri} alt="" width={44} height={44} style={{ borderRadius: 4 }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
