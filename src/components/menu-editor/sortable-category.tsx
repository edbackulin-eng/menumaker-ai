"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { memo } from "react";

import type { CategoryHeaderStyle, CornerRadius } from "@/lib/utils/resolve-menu-style";
import type { MenuCategory } from "@/services/ai/schemas/menu-content";
import { MenuCategoryShell } from "@/components/menu-render/menu-category-shell";
import { SortableItem } from "@/components/menu-editor/sortable-item";

export interface SortableCategoryProps {
  category: MenuCategory;
  currency?: string;
  headerStyle: CategoryHeaderStyle;
  cornerRadius: CornerRadius;
  uppercase: boolean;
  shadow: boolean;
  opaqueCard: boolean;
}

/**
 * Memoized for the same reason as SortableItem — see its doc comment.
 * `headerStyle`/`cornerRadius`/`uppercase`/`shadow`/`opaqueCard` are passed
 * as plain primitives (not the whole `ResolvedMenuStyle` object) precisely
 * to preserve that memoization: they're template-fixed and stay
 * value-stable across a color/font-scrubbing session, so `memo()`'s
 * shallow prop comparison still skips re-rendering this subtree on every
 * accent/font tweak — passing the whole style object (a fresh reference on
 * every parent render) would defeat that.
 */
export const SortableCategory = memo(function SortableCategory({
  category,
  currency,
  headerStyle,
  cornerRadius,
  uppercase,
  shadow,
  opaqueCard,
}: SortableCategoryProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    data: { type: "category" },
  });
  const itemIds = category.items.map((item) => item.id);

  return (
    <div
      ref={setNodeRef}
      data-category-id={category.id}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <MenuCategoryShell
        name={category.name}
        headerStyle={headerStyle}
        cornerRadius={cornerRadius}
        uppercase={uppercase}
        shadow={shadow}
        opaqueCard={opaqueCard}
        headerLeft={
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Перетягнути категорію «${category.name}» для зміни порядку`}
            className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center opacity-80 hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
        }
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {category.items.map((item) => (
            <SortableItem key={item.id} item={item} categoryId={category.id} currency={currency} />
          ))}
        </SortableContext>
      </MenuCategoryShell>
    </div>
  );
});
