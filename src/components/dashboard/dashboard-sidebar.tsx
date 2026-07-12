"use client";

import { usePathname } from "next/navigation";

import { SidebarNav } from "@/components/shared/sidebar-nav";
import { DASHBOARD_NAV_ITEMS } from "@/components/dashboard/dashboard-nav-items";

/** Desktop-only (see DashboardMobileNav for the small-screen equivalent) — hidden below `lg`. */
export function DashboardSidebar() {
  const pathname = usePathname();

  const items = DASHBOARD_NAV_ITEMS.map((item) => ({
    ...item,
    // Exact match for "/dashboard" itself (it would otherwise also match
    // "/dashboard/credits" etc. as a prefix); prefix match for nested pages.
    active: item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href),
  }));

  return <SidebarNav items={items} className="sticky top-0 hidden h-screen lg:flex" />;
}
