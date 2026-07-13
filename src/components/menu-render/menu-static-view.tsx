import { getAccentColorHex } from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import {
  backgroundToCssValue,
  resolvePageForeground,
  type ResolvedMenuStyle,
} from "@/lib/utils/resolve-menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { StaticCategory } from "@/components/menu-render/static-category";

export interface MenuStaticViewProps {
  content: MenuContent;
  style: ResolvedMenuStyle;
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
export function MenuStaticView({ content, style }: MenuStaticViewProps) {
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
          fontFamily: "var(--menu-font)",
          color: "var(--menu-page-fg)",
          columns: style.columns,
          columnGap: "1rem",
          ...backgroundToCssValue(style.background),
        } as React.CSSProperties
      }
      className={style.background ? "rounded-lg border p-4" : "bg-background rounded-lg border p-4"}
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
