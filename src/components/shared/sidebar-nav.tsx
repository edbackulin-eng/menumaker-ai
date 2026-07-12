import type { LucideIcon } from "lucide-react";
import NextLink from "next/link";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils/cn";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  active?: boolean;
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
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <LinkComponent
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "text-body-sm duration-fast flex h-9 items-center gap-2.5 rounded-sm px-3 font-medium transition-colors",
              item.active
                ? "bg-accent-50 text-accent-800"
                : "text-foreground-secondary hover:bg-surface-secondary hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {item.label}
          </LinkComponent>
        );
      })}
    </nav>
  );
}
