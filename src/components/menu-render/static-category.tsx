import { memo } from "react";

import type { MenuCategory } from "@/services/ai/schemas/menu-content";
import { MenuCategoryShell } from "@/components/menu-render/menu-category-shell";
import { StaticMenuItem } from "@/components/menu-render/static-menu-item";

export interface StaticCategoryProps {
  category: MenuCategory;
  currency?: string;
}

/** Non-interactive equivalent of the editor's SortableCategory. */
export const StaticCategory = memo(function StaticCategory({
  category,
  currency,
}: StaticCategoryProps) {
  return (
    <MenuCategoryShell name={category.name}>
      {category.items.map((item) => (
        <StaticMenuItem key={item.id} item={item} currency={currency} />
      ))}
    </MenuCategoryShell>
  );
});
