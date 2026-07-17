import type { ReactNode } from "react";

import {
  CORNER_RADIUS_PX,
  type CategoryHeaderStyle,
  type CornerRadius,
} from "@/lib/utils/resolve-menu-style";

export interface MenuCategoryShellProps {
  name: string;
  /** Editor-only: the drag-handle button. Static contexts render nothing here. */
  headerLeft?: ReactNode;
  children: ReactNode;
  headerStyle: CategoryHeaderStyle;
  cornerRadius: CornerRadius;
  uppercase: boolean;
  shadow: boolean;
  /** `false` once a template sets a custom page `background` — the card then sits directly on that background (border-only) instead of painting its own opaque white fill on top of it. */
  opaqueCard: boolean;
}

/**
 * The card chrome (border/background, category heading treatment) shared
 * by the editor's SortableCategory and the read-only StaticCategory — same
 * split rationale as MenuItemContent. `headerLeft` is the only seam: a drag
 * handle in the editor, nothing in a static render.
 *
 * `headerStyle` picks between three genuinely different compositions (Stage
 * 13), not three colors of the same layout:
 * - `solid-bar`: the original look — a filled accent-colored bar, text in
 *   the auto-contrasted `--menu-accent-text`.
 * - `underline`: no fill, just a colored rule under the heading — text in
 *   the accent color itself (airier, works well on a card that already
 *   sits on a colored/dark page background).
 * - `boxed-outline`: an accent-colored border frames the heading, no fill.
 */
export function MenuCategoryShell({
  name,
  headerLeft,
  children,
  headerStyle,
  cornerRadius,
  uppercase,
  shadow,
  opaqueCard,
}: MenuCategoryShellProps) {
  const radiusPx = CORNER_RADIUS_PX[cornerRadius];
  const headingStyle: React.CSSProperties = {
    fontFamily: "var(--menu-heading-font)",
    textTransform: uppercase ? "uppercase" : "none",
    letterSpacing: uppercase ? "0.05em" : undefined,
  };

  return (
    <div
      data-testid="category-card"
      style={{
        breakInside: "avoid",
        borderRadius: radiusPx,
        boxShadow: shadow ? "0 4px 16px rgba(0,0,0,0.12)" : undefined,
        // Menu-scoped tokens, set by MenuStaticView/MenuLivePreview from
        // MENU_SURFACE. Previously `var(--color-surface)` + a `border-border`
        // class — application tokens, which turned every menu card near-black
        // the moment the app went dark in Stage 14. Same resolved values as
        // before (#ffffff / #e5e5e5), so the menu itself is unchanged.
        backgroundColor: opaqueCard ? "var(--menu-surface)" : "transparent",
        borderColor: "var(--menu-border)",
      }}
      className="mb-4 overflow-hidden border"
    >
      {headerStyle === "solid-bar" && (
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            backgroundColor: "var(--menu-accent)",
            color: "var(--menu-accent-text)",
            borderRadius: `${radiusPx}px ${radiusPx}px 0 0`,
          }}
        >
          {headerLeft}
          <h3 data-testid="category-name" className="text-body font-semibold" style={headingStyle}>
            {name}
          </h3>
        </div>
      )}
      {headerStyle === "underline" && (
        <div
          className="flex items-center gap-2 px-3 pt-3 pb-2"
          style={{ borderBottom: "2px solid var(--menu-accent)" }}
        >
          {headerLeft}
          <h3
            data-testid="category-name"
            className="text-body font-semibold"
            style={{ ...headingStyle, color: "var(--menu-accent)" }}
          >
            {name}
          </h3>
        </div>
      )}
      {headerStyle === "boxed-outline" && (
        <div className="p-3 pb-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              border: "1.5px solid var(--menu-accent)",
              borderRadius: Math.max(radiusPx - 2, 0),
            }}
          >
            {headerLeft}
            <h3
              data-testid="category-name"
              className="text-body font-semibold"
              style={{ ...headingStyle, color: "var(--menu-accent)" }}
            >
              {name}
            </h3>
          </div>
        </div>
      )}
      <ul className="px-3">{children}</ul>
    </div>
  );
}
