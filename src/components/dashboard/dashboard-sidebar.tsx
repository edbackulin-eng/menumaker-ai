"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { DASHBOARD_NAV_ITEMS } from "@/components/dashboard/dashboard-nav-items";

/** Desktop-only (see DashboardMobileNav for the small-screen equivalent) — hidden below `lg`. */
export function DashboardSidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const items = DASHBOARD_NAV_ITEMS.map((item) => ({
    ...item,
    label: t(`items.${item.labelKey}`),
    // Exact match for "/dashboard" itself (it would otherwise also match
    // "/dashboard/credits" etc. as a prefix); prefix match for nested pages.
    active: item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href),
  }));

  return (
    <SidebarNav
      items={items}
      ariaLabel={t("ariaMain")}
      linkComponent={Link}
      className="sticky top-0 hidden h-screen lg:flex"
    />
  );
}
