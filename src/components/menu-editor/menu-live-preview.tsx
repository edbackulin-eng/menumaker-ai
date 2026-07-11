"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { memo } from "react";

import {
  getAccentColorHex,
  type AccentColorId,
  type FontId,
  type LayoutColumns,
} from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { SortableCategory } from "@/components/menu-editor/sortable-category";

export interface MenuLivePreviewProps {
  orderedContent: MenuContent;
  accentColorId: AccentColorId;
  fontId: FontId;
  columns: LayoutColumns;
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
  accentColorId,
  fontId,
  columns,
}: MenuLivePreviewProps) {
  const accentHex = getAccentColorHex(accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);
  const categoryIds = orderedContent.categories.map((category) => category.id);

  return (
    <div
      data-testid="menu-preview"
      style={
        {
          "--menu-accent": accentHex,
          "--menu-accent-text": accentTextHex,
          "--menu-font": FONT_ID_TO_CSS_VARIABLE[fontId],
          fontFamily: "var(--menu-font)",
          columns,
          columnGap: "1rem",
        } as React.CSSProperties
      }
      className="bg-background text-foreground rounded-lg border p-4"
    >
      <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
        {orderedContent.categories.map((category) => (
          <SortableCategory
            key={category.id}
            category={category}
            currency={orderedContent.currency}
          />
        ))}
      </SortableContext>
    </div>
  );
});
