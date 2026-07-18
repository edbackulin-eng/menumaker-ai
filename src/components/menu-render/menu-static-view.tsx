import { getAccentColorHex } from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import {
  backgroundToCssValue,
  MENU_SURFACE,
  resolvePageForeground,
  type ResolvedMenuStyle,
} from "@/lib/utils/resolve-menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { StaticCategory } from "@/components/menu-render/static-category";
import { ModernMenuView } from "@/components/menu-render/modern/modern-menu-view";

export interface MenuStaticViewProps {
  content: MenuContent;
  style: ResolvedMenuStyle;
  /**
   * Fallback for the banner when `content.venue.name` is unset — normally
   * the menu's own title. Only the `banner-two-column` engine reads it;
   * previews that have no title (template gallery, empty state) may omit
   * it, and the banner then renders its rule alone.
   */
  menuTitle?: string;
  /** Pre-rendered QR for the footer. Only meaningful for engines that have a footer, and only when the menu is published. */
  qrDataUri?: string;
  /** Footer QR caption, localized in the menu's content locale. */
  qrLabel?: string;
}

/**
 * Read-only equivalent of the editor's MenuLivePreview (Stage 7.5) — same
 * visual output (colors/font/layout resolved identically, same
 * MenuCategoryShell/MenuItemContent primitives), but no dnd-kit anywhere in
 * the tree. Used by the public web menu page (app/m/[slug]) — a visitor
 * scanning a QR code at a table has no business seeing drag handles, and
 * dnd-kit's `useSortable()` requires a DndContext ancestor this page
 * deliberately doesn't have.
 */
export function MenuStaticView({
  content,
  style,
  menuTitle,
  qrDataUri,
  qrLabel,
}: MenuStaticViewProps) {
  // The one branch point between layout engines in the DOM renderer (the
  // Satori and react-pdf renderers each have exactly one of their own).
  // Stage 3's remaining engines add cases here and nothing else.
  if (style.layoutEngine === "banner-two-column") {
    return (
      <ModernMenuView
        content={content}
        style={style}
        fallbackVenueName={menuTitle ?? ""}
        {...(qrDataUri ? { qrDataUri } : {})}
        qrLabel={qrLabel ?? ""}
      />
    );
  }

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
