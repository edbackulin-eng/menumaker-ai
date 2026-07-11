import {
  closestCorners,
  getFirstCollision,
  getScrollableAncestors,
  KeyboardCode,
  type Active,
  type DroppableContainer,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { hasSortableData } from "@dnd-kit/sortable";

const DIRECTIONS: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

function isSameContainer(a: DroppableContainer, b: DroppableContainer): boolean {
  if (!hasSortableData(a) || !hasSortableData(b)) return false;
  return a.data.current.sortable.containerId === b.data.current.sortable.containerId;
}

function isAfter(a: DroppableContainer, b: DroppableContainer): boolean {
  if (!hasSortableData(a) || !hasSortableData(b)) return false;
  if (!isSameContainer(a, b)) return false;
  return a.data.current.sortable.index < b.data.current.sortable.index;
}

/**
 * A drop-in replacement for @dnd-kit/sortable's own `sortableKeyboardCoordinates`,
 * restricted to droppable containers that share the active item's own
 * `data.type` ("category" or "item" — see MenuStyleEditor's useSortable
 * calls).
 *
 * Why: this editor nests an items SortableContext *inside* each category's
 * DOM subtree, all under one shared DndContext (categories and items are
 * both "just" sortables to dnd-kit — see docs/menu-editor.md). The stock
 * coordinate getter scans every registered droppable rect regardless of
 * nesting level; while dragging a category with ArrowDown, a rect
 * belonging to that very category's own item rows can be closer (its top
 * is also below the category's top) than the next sibling category, so
 * keyboard reordering silently lands back inside the same category instead
 * of moving to the next one. The pointer-based collision path has the
 * analogous problem, fixed the same way in MenuStyleEditor.handleDragEnd
 * (resolving an `over` item back up to its parent category) — this is that
 * fix's keyboard-navigation counterpart.
 */
export const categoryAwareKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  const {
    context: {
      active,
      collisionRect,
      droppableRects,
      droppableContainers,
      over,
      scrollableAncestors,
    },
  } = args;

  if (!DIRECTIONS.includes(event.code)) return undefined;
  event.preventDefault();
  if (!active || !collisionRect) return undefined;

  const activeType = (active as Active).data.current?.type as string | undefined;

  const filteredContainers: DroppableContainer[] = [];
  droppableContainers.getEnabled().forEach((entry) => {
    if (!entry || entry.disabled) return;
    if (entry.data.current?.type !== activeType) return;

    const rect = droppableRects.get(entry.id);
    if (!rect) return;

    switch (event.code) {
      case KeyboardCode.Down:
        if (collisionRect.top < rect.top) filteredContainers.push(entry);
        break;
      case KeyboardCode.Up:
        if (collisionRect.top > rect.top) filteredContainers.push(entry);
        break;
      case KeyboardCode.Left:
        if (collisionRect.left > rect.left) filteredContainers.push(entry);
        break;
      case KeyboardCode.Right:
        if (collisionRect.left < rect.left) filteredContainers.push(entry);
        break;
    }
  });

  const collisions = closestCorners({
    active,
    collisionRect,
    droppableRects,
    droppableContainers: filteredContainers,
    pointerCoordinates: null,
  });
  let closestId = getFirstCollision(collisions, "id");
  if (closestId === over?.id && collisions.length > 1) {
    closestId = collisions[1]!.id;
  }
  if (closestId == null) return undefined;

  const activeDroppable = droppableContainers.get(active.id);
  const newDroppable = droppableContainers.get(closestId);
  const newRect = newDroppable ? droppableRects.get(newDroppable.id) : null;
  const newNode = newDroppable?.node.current;
  if (!newNode || !newRect || !activeDroppable || !newDroppable) return undefined;

  const newScrollAncestors = getScrollableAncestors(newNode);
  const hasDifferentScrollAncestors = newScrollAncestors.some(
    (element, index) => scrollableAncestors[index] !== element,
  );
  const hasSameContainer = isSameContainer(activeDroppable, newDroppable);
  const isAfterActive = isAfter(activeDroppable, newDroppable);
  const offset =
    hasDifferentScrollAncestors || !hasSameContainer
      ? { x: 0, y: 0 }
      : {
          x: isAfterActive ? collisionRect.width - newRect.width : 0,
          y: isAfterActive ? collisionRect.height - newRect.height : 0,
        };

  const rectCoordinates = { x: newRect.left, y: newRect.top };
  return offset.x && offset.y
    ? rectCoordinates
    : { x: rectCoordinates.x - offset.x, y: rectCoordinates.y - offset.y };
};
