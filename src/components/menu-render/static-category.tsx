import { memo } from "react";

import type { ResolvedMenuStyle } from "@/lib/utils/resolve-menu-style";
import type { MenuCategory } from "@/services/ai/schemas/menu-content";
import { MenuCategoryShell } from "@/components/menu-render/menu-category-shell";
import { StaticMenuItem } from "@/components/menu-render/static-menu-item";

export interface StaticCategoryProps {
  category: MenuCategory;
  currency?: string;
  style: ResolvedMenuStyle;
}

/** Non-interactive equivalent of the editor's SortableCategory. */
export const StaticCategory = memo(function StaticCategory({
  category,
  currency,
  style,
}: StaticCategoryProps) {
  return (
    <MenuCategoryShell
      name={category.name}
      headerStyle={style.categoryHeaderStyle}
      cornerRadius={style.cornerRadius}
      uppercase={style.categoryNameTransform === "uppercase"}
      shadow={style.cardShadow}
      opaqueCard={!style.background}
    >
      {category.items.map((item) => (
        <StaticMenuItem key={item.id} item={item} currency={currency} />
      ))}
    </MenuCategoryShell>
  );
});
