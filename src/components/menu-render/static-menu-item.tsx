import { memo } from "react";

import type { MenuItem } from "@/services/ai/schemas/menu-content";
import { MenuItemContent } from "@/components/menu-render/menu-item-content";

export interface StaticMenuItemProps {
  item: MenuItem;
  currency?: string;
}

/** Non-interactive equivalent of the editor's SortableItem — same `<li>` chrome, no drag handle/dnd-kit. */
export const StaticMenuItem = memo(function StaticMenuItem({
  item,
  currency,
}: StaticMenuItemProps) {
  return (
    <li
      data-testid="item-row"
      className="border-border/60 flex items-start gap-2 border-b py-2 last:border-b-0"
    >
      <MenuItemContent item={item} currency={currency} />
    </li>
  );
});
