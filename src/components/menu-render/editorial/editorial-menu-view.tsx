import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import type { MenuEngineViewProps } from "@/components/menu-render/engine-view-props";
import {
  categoryHeroPhotoUrl,
  parseEditorialPalette,
  type EditorialPalette,
} from "@/components/menu-render/editorial/editorial-palette";
import { dishPhotoUrlForEngine } from "@/lib/utils/dish-photo-url";
import type { MenuCategory, MenuItem } from "@/services/ai/schemas/menu-content";

function EditorialDish({
  item,
  currency,
  palette,
  isLast,
}: {
  item: MenuItem;
  currency: string | undefined;
  palette: EditorialPalette;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "baseline",
        padding: "16px 0",
        borderBottom: isLast ? "none" : `1px solid ${palette.rule}`,
      }}
    >
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--menu-heading-font)",
            fontSize: 20,
            fontWeight: 500,
            color: palette.text,
          }}
        >
          {item.name}
        </div>
        {item.description && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13.5,
              lineHeight: 1.5,
              color: palette.textMuted,
              maxWidth: 520,
            }}
          >
            {item.description}
          </p>
        )}
      </div>
      {item.price !== undefined && (
        <div
          style={{
            fontFamily: "var(--menu-heading-font)",
            fontSize: 18,
            color: palette.accent,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {item.price}
          {currency ? ` ${currency}` : ""}
        </div>
      )}
    </div>
  );
}

function EditorialCategory({
  category,
  currency,
  palette,
  hidePhotos,
}: {
  category: MenuCategory;
  currency: string | undefined;
  palette: EditorialPalette;
  hidePhotos: boolean;
}) {
  // Editorial's photo is the category hero, not a per-dish thumbnail, so
  // "without photos" drops the hero (and its placeholder) and the heading
  // becomes the section's opening — a magazine feature can lead with a
  // display heading alone.
  const hero = hidePhotos ? undefined : categoryHeroPhotoUrl(category.items);
  return (
    <section style={{ marginBottom: 56 }}>
      {!hidePhotos &&
        (hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dishPhotoUrlForEngine(hero, "editorial")}
            alt=""
            style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: 300, backgroundColor: palette.heroPlaceholder }} />
        ))}
      <h3
        style={{
          fontFamily: "var(--menu-heading-font)",
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: 0.5,
          color: palette.text,
          margin: hidePhotos ? "0 0 4px" : "22px 0 4px",
        }}
      >
        {category.name}
      </h3>
      <div style={{ width: 52, height: 3, backgroundColor: palette.accent, marginBottom: 8 }} />
      <div>
        {category.items.map((item, index) => (
          <EditorialDish
            key={item.id}
            item={item}
            currency={currency}
            palette={palette}
            isLast={index === category.items.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * The `editorial` layout engine's DOM renderer — a magazine feature spread.
 * A single wide reading column, and each category opens with a full-width
 * hero photo (its first dish that has one) beneath a large display
 * heading, then the dishes as an airy ruled list.
 *
 * The hero is the largest photo any engine shows — that is the engine's
 * whole identity, and why it requests the `editorial` (1200px) crop rather
 * than Grid's tile-sized one. Where Grid tiles every dish and Modern gives
 * each a thumbnail, Editorial spends its imagery on one commanding photo
 * per section and lets the dishes read as prose beneath it — for authorial
 * kitchens and tasting menus, not a photo per plate.
 *
 * One column, not two: a magazine feature is a single measured column of
 * text under full-bleed imagery, and that also means the exports need no
 * column-distribution step — order is simply top to bottom.
 */
export function EditorialMenuView({
  content,
  style,
  menuTitle,
  qrDataUri,
  qrLabel,
}: MenuEngineViewProps) {
  const palette = parseEditorialPalette(style.palette);
  const venue = content.venue;
  const currency = resolveCurrencyDisplay(content.currency);
  const heading = venue?.name ?? menuTitle ?? "";
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");

  return (
    <div
      data-testid="editorial-menu-view"
      data-layout-engine="editorial"
      style={
        {
          "--menu-font": FONT_ID_TO_CSS_VARIABLE[style.fontId],
          "--menu-heading-font": FONT_ID_TO_CSS_VARIABLE[style.headingFontId],
          fontFamily: "var(--menu-font)",
          backgroundColor: palette.page,
          color: palette.text,
          padding: "44px 44px 32px",
        } as React.CSSProperties
      }
      className="rounded-lg"
    >
      {(heading || venue?.tagline) && (
        <header style={{ marginBottom: 44 }}>
          {venue?.tagline && (
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 12,
                letterSpacing: 5,
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
                fontSize: 52,
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: -0.5,
                margin: 0,
                color: palette.text,
              }}
            >
              {heading}
            </h2>
          )}
          <div style={{ marginTop: 20, height: 1, width: "100%", backgroundColor: palette.rule }} />
        </header>
      )}

      <div style={{ maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
        {content.categories.map((category) => (
          <EditorialCategory
            key={category.id}
            category={category}
            currency={currency}
            palette={palette}
            hidePhotos={content.hidePhotos ?? false}
          />
        ))}
      </div>

      {(contactLine || qrDataUri) && (
        <footer
          style={{
            marginTop: 8,
            paddingTop: 18,
            borderTop: `1px solid ${palette.footerRule}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            fontSize: 12.5,
            letterSpacing: 0.5,
            color: palette.footerText,
          }}
        >
          {contactLine && <span>{contactLine}</span>}
          {qrDataUri && (
            <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 10, letterSpacing: 1 }}>{qrLabel}</span>
              {/* eslint-disable-next-line @next/next/no-img-element -- generated data: URI */}
              <img src={qrDataUri} alt="" width={42} height={42} style={{ borderRadius: 3 }} />
            </span>
          )}
        </footer>
      )}
    </div>
  );
}
