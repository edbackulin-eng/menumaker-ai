import type { MenuContent } from "@/services/ai/schemas/menu-content";
import type { StyleOverridesInput } from "@/lib/validations/menu-style";

/**
 * Reorders `content` per `styleOverrides.categoryOrder`/`itemOrder` — falls
 * back to the content's own order for anything the override arrays don't
 * (yet) mention, so a stale order (e.g. right after a new item was added
 * elsewhere) degrades gracefully instead of dropping items.
 */
export function applyStyleOrder(
  content: MenuContent,
  styleOverrides: StyleOverridesInput,
): MenuContent {
  const categories = orderBy(content.categories, styleOverrides.categoryOrder, (c) => c.id);

  return {
    ...content,
    categories: categories.map((category) => ({
      ...category,
      items: orderBy(category.items, styleOverrides.itemOrder?.[category.id], (item) => item.id),
    })),
  };
}

function orderBy<T>(items: T[], order: string[] | undefined, getId: (item: T) => string): T[] {
  if (!order || order.length === 0) return items;

  const byId = new Map(items.map((item) => [getId(item), item]));
  const ordered: T[] = [];
  for (const id of order) {
    const item = byId.get(id);
    if (item) {
      ordered.push(item);
      byId.delete(id);
    }
  }
  // Anything not covered by `order` (e.g. added after the order was saved) goes at the end, in its original relative order.
  for (const item of items) {
    if (byId.has(getId(item))) ordered.push(item);
  }
  return ordered;
}
