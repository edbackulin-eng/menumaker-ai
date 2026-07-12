import {
  getAccentColorHex,
  type AccentColorId,
  type FontId,
  type LayoutColumns,
} from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { StaticCategory } from "@/components/menu-render/static-category";

export interface MenuStaticViewProps {
  content: MenuContent;
  accentColorId: AccentColorId;
  fontId: FontId;
  columns: LayoutColumns;
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
export function MenuStaticView({ content, accentColorId, fontId, columns }: MenuStaticViewProps) {
  const accentHex = getAccentColorHex(accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);

  return (
    <div
      data-testid="menu-static-view"
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
      {content.categories.map((category) => (
        <StaticCategory key={category.id} category={category} currency={content.currency} />
      ))}
    </div>
  );
}
