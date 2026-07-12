"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav-items";

/**
 * Deliberately its own dark-themed markup rather than reusing
 * shared/sidebar-nav.tsx — that component's classes are hardcoded to the
 * light user-Dashboard palette, and the whole point here (Stage 10 brief)
 * is that an admin can never mistake this for their own Dashboard. Desktop
 * only, same `hidden lg:flex` split as the user Dashboard's sidebar/mobile
 * nav pair (Stage 8) — the admin panel isn't a mobile-first surface, so no
 * bottom-nav equivalent was built for it.
 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Навігація адмін-панелі"
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-neutral-800 bg-neutral-950 p-4 lg:flex"
    >
      <div className="mb-4 flex items-center gap-2 px-3 text-white">
        <ShieldCheck className="size-5 text-amber-400" aria-hidden="true" />
        <span className="text-body-sm font-semibold">Admin Panel</span>
      </div>
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-body-sm duration-fast flex h-9 items-center gap-2.5 rounded-sm px-3 font-medium transition-colors",
              active
                ? "bg-amber-400/15 text-amber-300"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
