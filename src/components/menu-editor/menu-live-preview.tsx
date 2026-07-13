"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { memo } from "react";

import { getAccentColorHex } from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import {
  backgroundToCssValue,
  resolvePageForeground,
  type ResolvedMenuStyle,
} from "@/lib/utils/resolve-menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { SortableCategory } from "@/components/menu-editor/sortable-category";

export interface MenuLivePreviewProps {
  orderedContent: MenuContent;
  style: ResolvedMenuStyle;
}

/**
 * Memoized, and — critically — its own re-render on a color/font change is
 * cheap: only this wrapper's `style` attribute (a handful of CSS custom
 * properties) changes, not the category/item subtree. SortableCategory and
 * SortableItem read colors/font through `var(--menu-accent)` /
 * `var(--menu-font)` in their own inline styles rather than as React props,
 * so they never re-render just because the user is dragging a color swatch
 * or scrubbing through fonts — only an actual content/order change
 * re-renders them (see each component's own doc comment).
 */
export const MenuLivePreview = memo(function MenuLivePreview({
  orderedContent,
  style,
}: MenuLivePreviewProps) {
  const accentHex = getAccentColorHex(style.accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);
  const pageForeground = resolvePageForeground(style.background);
  const categoryIds = orderedContent.categories.map((category) => category.id);

  return (
    <div
      data-testid="menu-preview"
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
      <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
        {orderedContent.categories.map((category) => (
          <SortableCategory
            key={category.id}
            category={category}
            currency={orderedContent.currency}
            headerStyle={style.categoryHeaderStyle}
            cornerRadius={style.cornerRadius}
            uppercase={style.categoryNameTransform === "uppercase"}
            shadow={style.cardShadow}
            opaqueCard={!style.background}
          />
        ))}
      </SortableContext>
    </div>
  );
});
