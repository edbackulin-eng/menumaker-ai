import type { ReactNode } from "react";

export interface MenuCategoryShellProps {
  name: string;
  /** Editor-only: the drag-handle button. Static contexts render nothing here. */
  headerLeft?: ReactNode;
  children: ReactNode;
}

/**
 * The card chrome (border/background, colored header bar, heading) shared
 * by the editor's SortableCategory and the read-only StaticCategory — same
 * split rationale as MenuItemContent. `headerLeft` is the only seam: a drag
 * handle in the editor, nothing in a static render.
 */
export function MenuCategoryShell({ name, headerLeft, children }: MenuCategoryShellProps) {
  return (
    <div
      data-testid="category-card"
      style={{ breakInside: "avoid" }}
      className="border-border bg-surface mb-4 overflow-hidden rounded-md border"
    >
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: "var(--menu-accent)", color: "var(--menu-accent-text)" }}
      >
        {headerLeft}
        <h3
          data-testid="category-name"
          className="text-body font-semibold"
          style={{ fontFamily: "var(--menu-font)" }}
        >
          {name}
        </h3>
      </div>
      <ul className="px-3">{children}</ul>
    </div>
  );
}
