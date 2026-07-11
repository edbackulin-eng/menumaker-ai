"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { memo } from "react";

import type { MenuCategory } from "@/services/ai/schemas/menu-content";
import { SortableItem } from "@/components/menu-editor/sortable-item";

export interface SortableCategoryProps {
  category: MenuCategory;
  currency?: string;
}

/** Memoized for the same reason as SortableItem — see its doc comment. */
export const SortableCategory = memo(function SortableCategory({
  category,
  currency,
}: SortableCategoryProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    data: { type: "category" },
  });
  const itemIds = category.items.map((item) => item.id);

  return (
    <div
      ref={setNodeRef}
      data-testid="category-card"
      data-category-id={category.id}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        breakInside: "avoid",
        opacity: isDragging ? 0.6 : 1,
      }}
      className="border-border bg-surface mb-4 overflow-hidden rounded-md border"
    >
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: "var(--menu-accent)", color: "var(--menu-accent-text)" }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Перетягнути категорію «${category.name}» для зміни порядку`}
          className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center opacity-80 hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
        <h3
          data-testid="category-name"
          className="text-body font-semibold"
          style={{ fontFamily: "var(--menu-font)" }}
        >
          {category.name}
        </h3>
      </div>
      <ul className="px-3">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {category.items.map((item) => (
            <SortableItem key={item.id} item={item} categoryId={category.id} currency={currency} />
          ))}
        </SortableContext>
      </ul>
    </div>
  );
});
