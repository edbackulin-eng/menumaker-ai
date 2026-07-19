import { getAccentColorHex } from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import {
  backgroundToCssValue,
  MENU_SURFACE,
  resolvePageForeground,
} from "@/lib/utils/resolve-menu-style";
import { StaticCategory } from "@/components/menu-render/static-category";
import type { MenuEngineViewProps } from "@/components/menu-render/engine-view-props";

/**
 * The `classic` engine's DOM tree — the card-per-category layout every
 * template used before Stage 2 added a second engine.
 *
 * Lifted verbatim out of MenuStaticView (Stage 3) so that choosing an
 * engine is a registry lookup rather than an if-chain with one engine
 * inlined as the "else". Nothing about the markup or the styles changed in
 * the move: the same wrapper, the same CSS custom properties, the same
 * StaticCategory children, so all 11 classic templates render exactly as
 * before.
 *
 * It ignores `menuTitle`/`qrDataUri`/`qrLabel` — this engine has neither a
 * banner nor a footer to put them in. That is not an oversight to fix
 * later: the props exist on the shared engine interface because *some*
 * engines need them, and an engine is free to use none of them.
 */
export function ClassicMenuView({ content, style }: MenuEngineViewProps) {
  const accentHex = getAccentColorHex(style.accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);
  const pageForeground = resolvePageForeground(style.background);

  return (
    <div
      data-testid="menu-static-view"
      style={
        {
          "--menu-accent": accentHex,
          "--menu-accent-text": accentTextHex,
          "--menu-font": FONT_ID_TO_CSS_VARIABLE[style.fontId],
          "--menu-heading-font": FONT_ID_TO_CSS_VARIABLE[style.headingFontId],
          "--menu-page-fg": pageForeground.primary,
          "--menu-page-fg-secondary": pageForeground.secondary,
          "--menu-divider": pageForeground.divider,
          "--menu-surface": MENU_SURFACE.card,
          "--menu-border": MENU_SURFACE.border,
          fontFamily: "var(--menu-font)",
          color: "var(--menu-page-fg)",
          columns: style.columns,
          columnGap: "1rem",
          // Literal menu token, never `bg-background`: that is an application
          // token and went dark in Stage 14, which would drag the menu
          // artifact with it. Same #fafafa the app token used to resolve to,
          // so the rendered menu is unchanged. See MENU_SURFACE's doc comment.
          //
          // The bare `border` class below is left alone on purpose: in
          // Tailwind v4 it resolves to `currentColor`, i.e. `--menu-page-fg`
          // — already menu-scoped, no app token involved. Pinning it to a
          // fixed hex here would visibly restyle every menu.
          backgroundColor: MENU_SURFACE.pageBackground,
          ...backgroundToCssValue(style.background),
        } as React.CSSProperties
      }
      className="rounded-lg border p-4"
    >
      {content.categories.map((category) => (
        <StaticCategory
          key={category.id}
          category={category}
          currency={content.currency}
          style={style}
        />
      ))}
    </div>
  );
}
