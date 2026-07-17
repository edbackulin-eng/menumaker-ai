"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { memo } from "react";

import type { MenuItem } from "@/services/ai/schemas/menu-content";
import { MenuItemContent } from "@/components/menu-render/menu-item-content";

export interface SortableItemProps {
  item: MenuItem;
  categoryId: string;
  currency?: string;
}

/**
 * Memoized: re-renders only when `item`/`categoryId` actually change
 * (content edits or reordering), never when the live preview's color/font
 * changes — those are applied via CSS custom properties on an ancestor
 * element (see MenuLivePreview), not props, so this component's own props
 * are untouched by a color/font tweak.
 */
export const SortableItem = memo(function SortableItem({
  item,
  categoryId,
  currency,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: "item", categoryId },
  });

  return (
    <li
      ref={setNodeRef}
      data-testid="item-row"
      data-item-id={item.id}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderColor: "var(--menu-divider)",
      }}
      className="flex items-start gap-2 border-b py-2 last:border-b-0"
      aria-roledescription="перетягувана страва"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Перетягнути «${item.name}» для зміни порядку`}
        // Editor affordance, but it sits *on* the light menu card — so it
        // reads the menu's own foreground token, not the app's
        // `text-foreground-tertiary`, which is tuned for dark surfaces and
        // would wash out here.
        style={{ color: "var(--menu-page-fg-secondary)" }}
        className="mt-0.5 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center opacity-70 hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>
      <MenuItemContent item={item} currency={currency} dimmed={isDragging} />
    </li>
  );
});
