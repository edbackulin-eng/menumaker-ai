import { memo } from "react";

import type { MenuItem } from "@/services/ai/schemas/menu-content";

export interface MenuItemContentProps {
  item: MenuItem;
  currency?: string;
  /** Editor-only: dims the text while the row is mid-drag. Static contexts (public page, exports) never pass this. */
  dimmed?: boolean;
}

/**
 * The actual visual content of one menu item — name/price/description —
 * shared by the editor's draggable SortableItem and the read-only
 * StaticMenuItem (public web menu, PNG/PDF export data source). Everything
 * *around* this (the `<li>`, drag handle, dnd-kit positioning) is specific
 * to whichever context renders it; this is the part that must look
 * identical everywhere, so it's the single place that owns it.
 */
export const MenuItemContent = memo(function MenuItemContent({
  item,
  currency,
  dimmed,
}: MenuItemContentProps) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <span
          data-testid="item-name"
          className="text-body font-medium"
          style={{ fontFamily: "var(--menu-font)", opacity: dimmed ? 0.5 : 1 }}
        >
          {item.name}
        </span>
        {item.price !== undefined && (
          <span
            className="text-body shrink-0 font-semibold"
            style={{ fontFamily: "var(--menu-font)" }}
          >
            {item.price} {currency ?? ""}
          </span>
        )}
      </div>
      {item.description && (
        <p
          className="text-caption text-foreground-secondary mt-0.5"
          style={{ fontFamily: "var(--menu-font)" }}
        >
          {item.description}
        </p>
      )}
    </div>
  );
});
