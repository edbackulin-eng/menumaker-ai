import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  active?: boolean;
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[];
}

/**
 * Structural shell for the Dashboard layout's sidebar — Stage 8 wires in
 * the real nav items (Menus, Credits, Settings, ...) via the `items` prop;
 * this component itself doesn't need to change.
 */
export function SidebarNav({ items, className, ...props }: SidebarNavProps) {
  return (
    <nav
      aria-label="Основна навігація"
      className={cn(
        "border-border bg-surface flex w-60 shrink-0 flex-col gap-1 border-r p-4",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
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
          </Link>
        );
      })}
    </nav>
  );
}
