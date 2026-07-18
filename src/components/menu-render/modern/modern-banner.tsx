import { MODERN_PALETTE } from "@/components/menu-render/modern/modern-palette";

export interface ModernBannerProps {
  /** Already resolved by the caller: `venue.name` if set, else the menu's own title. Empty only in previews that have neither, where the banner falls back to just its rule. */
  venueName: string;
  /** Spaced-caps superheading. Omitted entirely when the venue has none, rather than rendering an empty row. */
  tagline?: string;
}

/**
 * The title banner. This is the single element whose absence made previous
 * attempts read as "a list of dishes" rather than "a menu" — a menu opens
 * by naming the place.
 *
 * Flat `banner` fill, no gradient: @react-pdf/renderer cannot render one,
 * and this has to survive into the PDF unchanged.
 */
export function ModernBanner({ venueName, tagline }: ModernBannerProps) {
  return (
    <div
      data-testid="modern-banner"
      style={{
        position: "relative",
        height: 132,
        backgroundColor: MODERN_PALETTE.banner,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: `1px solid ${MODERN_PALETTE.bannerBorder}`,
      }}
    >
      <div style={{ textAlign: "center", paddingLeft: 16, paddingRight: 16 }}>
        {tagline && (
          <p
            data-testid="modern-tagline"
            style={{
              margin: "0 0 6px",
              fontSize: 10,
              letterSpacing: 4,
              color: MODERN_PALETTE.gold,
              textTransform: "uppercase",
            }}
          >
            {tagline}
          </p>
        )}
        {venueName && (
          <p
            data-testid="modern-venue-name"
            style={{
              margin: 0,
              fontFamily: "var(--menu-heading-font)",
              fontSize: 38,
              lineHeight: 1,
              color: MODERN_PALETTE.text,
              letterSpacing: 1,
            }}
          >
            {venueName}
          </p>
        )}
        <div
          data-testid="modern-banner-rule"
          style={{
            margin: "10px auto 0",
            width: 52,
            height: 1,
            backgroundColor: MODERN_PALETTE.gold,
          }}
        />
      </div>
    </div>
  );
}
