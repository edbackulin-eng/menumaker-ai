import type { LucideIcon } from "lucide-react";
import NextLink from "next/link";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils/cn";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  active?: boolean;
  /** Literal hex for the icon. Each nav destination owns a fixed colour so the sidebar reads as a set of distinct places rather than a monochrome list — see DASHBOARD_NAV_ITEMS. */
  iconColor?: string;
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[];
  ariaLabel?: string;
  /** Defaults to raw `next/link` — the design-system demo page (outside `[locale]`) needs that default; DashboardSidebar passes the locale-aware `Link` from `@/i18n/navigation` instead. */
  linkComponent?: ComponentType<{
    href: string;
    className?: string;
    "aria-current"?: "page" | undefined;
    children?: React.ReactNode;
  }>;
  /** Rendered above the nav items — e.g. DashboardSidebar's logo + "New menu" quick action. Kept as a slot rather than baked into this shared component so the design-system demo page's sidebar stays a plain nav list. */
  header?: React.ReactNode;
  /** Rendered below the nav items, pushed to the bottom (the slot owns its own `mt-auto`) — e.g. DashboardSidebar's credits block. */
  footer?: React.ReactNode;
}

/**
 * Structural shell for the Dashboard layout's sidebar — Stage 8 wires in
 * the real nav items (Menus, Credits, Settings, ...) via the `items` prop;
 * this component itself doesn't need to change.
 */
export function SidebarNav({
  items,
  ariaLabel = "Main navigation",
  linkComponent: LinkComponent = NextLink,
  header,
  footer,
  className,
  ...props
}: SidebarNavProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "border-border bg-surface flex w-60 shrink-0 flex-col gap-1 border-r p-4",
        className,
      )}
      {...props}
    >
      {header}
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <LinkComponent
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              // 8px/10px padding, 8px radius, 10px gap — the mockup's exact
              // density. Deliberately tight; roomier padding was the
              // "everything feels empty" complaint.
              // 13px is off the modular type scale (body-sm is 14px) — the
              // mockup's exact value, and the scale has no rung for it.
              "duration-fast flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] leading-5 font-medium transition-colors",
              "focus-visible:ring-ring focus-visible:ring-offset-sidebar focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              item.active
                ? "bg-surface-secondary text-foreground"
                : "text-foreground-secondary hover:bg-surface-secondary hover:text-foreground",
            )}
          >
            {/* The icon keeps its colour whether or not the item is active —
                only the label and the row background respond to selection. */}
            {Icon && (
              <Icon
                className="size-4 shrink-0"
                style={{ color: item.iconColor }}
                aria-hidden="true"
              />
            )}
            {item.label}
          </LinkComponent>
        );
      })}
      {footer}
    </nav>
  );
}
