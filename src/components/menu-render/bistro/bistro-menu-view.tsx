import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import type { MenuEngineViewProps } from "@/components/menu-render/engine-view-props";
import {
  parseBistroPalette,
  type BistroPalette,
} from "@/components/menu-render/bistro/bistro-palette";
import type { MenuCategory, MenuItem } from "@/services/ai/schemas/menu-content";

function BistroDishRow({
  item,
  currency,
  palette,
}: {
  item: MenuItem;
  currency: string | undefined;
  palette: BistroPalette;
}) {
  return (
    <div style={{ marginBottom: 12, breakInside: "avoid" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{ fontSize: 14.5, color: palette.text, minWidth: 0, overflowWrap: "anywhere" }}
        >
          {item.name}
        </span>
        {/* Flex spacer with a dotted baseline — the same leader technique
            Modern uses, and for the same reason: a flex child fills exactly
            the gap between an unwrappable name and the price, where a glyph
            run of dots would need per-row measuring. */}
        <span
          aria-hidden="true"
          style={{
            flex: "1 1 12px",
            minWidth: 12,
            // dashed, not dotted: Satori's CSS subset (the PNG export)
            // supports only solid/dashed borders, and this engine is
            // specified as identical across Web/PDF/PNG — so all three use
            // the one leader style all three can draw.
            borderBottom: `1px dashed ${palette.accent}`,
            transform: "translateY(-4px)",
          }}
        />
        {item.price !== undefined && (
          <span
            style={{
              fontFamily: "var(--menu-heading-font)",
              fontSize: 14.5,
              color: palette.accent,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {item.price}
            {currency ? ` ${currency}` : ""}
          </span>
        )}
      </div>
      {item.description && (
        // Not italic: the curated fonts ship only a regular weight, and
        // @react-pdf/renderer (the PDF export) hard-fails on a fontStyle it
        // has no registered face for rather than synthesising a slant. The
        // muted color already sets the description apart, and this keeps
        // Web/PDF/PNG identical.
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 12,
            color: palette.textMuted,
            lineHeight: 1.45,
          }}
        >
          {item.description}
        </p>
      )}
    </div>
  );
}

function BistroCategory({
  category,
  currency,
  palette,
}: {
  category: MenuCategory;
  currency: string | undefined;
  palette: BistroPalette;
}) {
  return (
    <section style={{ breakInside: "avoid-column", marginBottom: 22 }}>
      <h3
        style={{
          fontFamily: "var(--menu-heading-font)",
          fontSize: 19,
          fontWeight: 500,
          letterSpacing: 1,
          color: palette.text,
          textAlign: "center",
          margin: "0 0 3px",
        }}
      >
        {category.name}
      </h3>
      <div
        style={{
          width: 30,
          height: 1,
          backgroundColor: palette.accent,
          margin: "0 auto 12px",
        }}
      />
      {category.items.map((item) => (
        <BistroDishRow key={item.id} item={item} currency={currency} palette={palette} />
      ))}
    </section>
  );
}

/**
 * The `classic-elegant` (Bistro) layout engine's DOM renderer — a dense,
 * photo-free, serif fine-dining card, for restaurants whose menu is long
 * and whose identity is typographic rather than photographic.
 *
 * The defining choice is *no dish photos at all*: this is the one engine
 * where a plate photo per line would cheapen rather than sell, so
 * `item.photoUrl` is never read here (nor in its PNG/PDF trees). That, plus
 * the centered serif header and dotted leaders, is what separates it from
 * both classic (cards, sans, accent bars) and Grid (photo tiles).
 *
 * CSS multi-column, not grid — same reasoning as Modern: categories are
 * variable-height text and columns pack them continuously, and the exports
 * mirror this with distributeSequentially so Web/PDF/PNG agree on order.
 * Collapses to one column below 640px for phone QR scans.
 */
export function BistroMenuView({
  content,
  style,
  menuTitle,
  qrDataUri,
  qrLabel,
}: MenuEngineViewProps) {
  const palette = parseBistroPalette(style.palette);
  const venue = content.venue;
  const currency = resolveCurrencyDisplay(content.currency);
  const heading = venue?.name ?? menuTitle ?? "";
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");

  return (
    <div
      data-testid="bistro-menu-view"
      data-layout-engine="classic-elegant"
      style={
        {
          "--menu-font": FONT_ID_TO_CSS_VARIABLE[style.fontId],
          "--menu-heading-font": FONT_ID_TO_CSS_VARIABLE[style.headingFontId],
          fontFamily: "var(--menu-font)",
          backgroundColor: palette.page,
          color: palette.text,
          padding: "36px 40px 30px",
        } as React.CSSProperties
      }
      className="rounded-lg"
    >
      {(heading || venue?.tagline) && (
        <header
          style={{
            textAlign: "center",
            borderTop: `1px solid ${palette.rule}`,
            borderBottom: `1px solid ${palette.rule}`,
            padding: "18px 0 20px",
            marginBottom: 28,
          }}
        >
          {venue?.tagline && (
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 11,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: palette.accent,
              }}
            >
              {venue.tagline}
            </p>
          )}
          {heading && (
            <h2
              style={{
                fontFamily: "var(--menu-heading-font)",
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: 1,
                margin: 0,
                color: palette.text,
              }}
            >
              {heading}
            </h2>
          )}
        </header>
      )}

      <div className="columns-1 sm:columns-2" style={{ columnGap: 40 }}>
        {content.categories.map((category) => (
          <BistroCategory
            key={category.id}
            category={category}
            currency={currency}
            palette={palette}
          />
        ))}
      </div>

      {(contactLine || qrDataUri) && (
        <footer
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid ${palette.footerRule}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            letterSpacing: 0.5,
            color: palette.footerText,
          }}
        >
          {contactLine && <span>{contactLine}</span>}
          {qrDataUri && (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- a generated data: URI */}
              <img src={qrDataUri} alt="" width={40} height={40} style={{ borderRadius: 3 }} />
              <span style={{ fontSize: 10, letterSpacing: 1 }}>{qrLabel}</span>
            </span>
          )}
        </footer>
      )}
    </div>
  );
}
