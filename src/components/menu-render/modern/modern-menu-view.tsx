import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import { ModernBanner } from "@/components/menu-render/modern/modern-banner";
import { ModernCategory } from "@/components/menu-render/modern/modern-category";
import { ModernFooter } from "@/components/menu-render/modern/modern-footer";
import { MODERN_PALETTE } from "@/components/menu-render/modern/modern-palette";
import type { ResolvedMenuStyle } from "@/lib/utils/resolve-menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";

export interface ModernMenuViewProps {
  content: MenuContent;
  style: ResolvedMenuStyle;
  /** Used when `content.venue.name` is unset — the menu's own title, so the banner is never blank. */
  fallbackVenueName: string;
  qrDataUri?: string;
  /** Localized in the *menu's* content locale, not the viewer's UI locale — this is the restaurant's artifact. */
  qrLabel: string;
}

/**
 * The `banner-two-column` layout engine's DOM renderer — first of the four
 * engines Stage 3 will add, and deliberately a separate tree from the
 * classic one rather than more configuration on it (see MenuLayoutEngine).
 *
 * Two columns come from CSS multi-column rather than a grid: categories
 * vary wildly in height, and a grid would leave a ragged gap under the
 * shorter of each pair, whereas columns pack continuously. `columns-1
 * sm:columns-2` collapses to a single column below 640px — a visitor
 * scanning a QR at a table is on a phone, where two 26px-gutter columns
 * would be unreadable.
 *
 * Every color is a literal from MODERN_PALETTE, never an app token, and
 * there are no gradients anywhere: this same design has to survive into
 * @react-pdf/renderer, which supports neither.
 */
export function ModernMenuView({
  content,
  style,
  fallbackVenueName,
  qrDataUri,
  qrLabel,
}: ModernMenuViewProps) {
  const venue = content.venue;
  // Curated ids ("UAH") become their print form ("грн"); anything else —
  // including whatever analyzeMenu read off the source document — passes
  // through unchanged, so pre-existing menus keep rendering as before.
  const currencyDisplay = resolveCurrencyDisplay(content.currency);

  return (
    <div
      data-testid="modern-menu-view"
      data-layout-engine="banner-two-column"
      style={
        {
          "--menu-font": FONT_ID_TO_CSS_VARIABLE[style.fontId],
          "--menu-heading-font": FONT_ID_TO_CSS_VARIABLE[style.headingFontId],
          fontFamily: "var(--menu-font)",
          backgroundColor: MODERN_PALETTE.page,
          color: MODERN_PALETTE.text,
          overflow: "hidden",
        } as React.CSSProperties
      }
      className="rounded-lg"
    >
      <ModernBanner
        venueName={venue?.name ?? fallbackVenueName}
        {...(venue?.tagline ? { tagline: venue.tagline } : {})}
      />

      <div className="columns-1 sm:columns-2" style={{ padding: "24px 26px 20px", columnGap: 26 }}>
        {content.categories.map((category) => (
          <div key={category.id} style={{ breakInside: "avoid", marginBottom: 26 }}>
            <ModernCategory
              category={category}
              {...(currencyDisplay ? { currency: currencyDisplay } : {})}
              showBadges={style.showBadges}
            />
          </div>
        ))}
      </div>

      <ModernFooter
        {...(venue?.address ? { address: venue.address } : {})}
        {...(venue?.phone ? { phone: venue.phone } : {})}
        {...(qrDataUri ? { qrDataUri } : {})}
        qrLabel={qrLabel}
      />
    </div>
  );
}
