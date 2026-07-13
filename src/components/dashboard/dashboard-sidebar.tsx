"use client";

import { useTranslations } from "next-intl";
import { Coins, Plus } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { DASHBOARD_NAV_ITEMS } from "@/components/dashboard/dashboard-nav-items";

export interface DashboardSidebarProps {
  creditsBalance: number;
  freeMenuAvailable: boolean;
}

/** Desktop-only (see DashboardMobileNav for the small-screen equivalent) — hidden below `lg`. */
export function DashboardSidebar({ creditsBalance, freeMenuAvailable }: DashboardSidebarProps) {
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
      header={
        <div className="flex flex-col gap-3 pb-3">
          <Link
            href="/dashboard/credits"
            className="bg-accent-50 flex items-center gap-2 rounded-md px-3 py-2.5"
          >
            <Coins className="text-accent-700 size-4 shrink-0" aria-hidden="true" />
            <div className="flex min-w-0 flex-col">
              <span className="text-body-sm text-accent-800 font-semibold">
                {t("sidebar.creditsCount", { count: creditsBalance })}
              </span>
              {freeMenuAvailable && (
                <span className="text-caption text-accent-700">
                  {t("sidebar.freeTrialAvailable")}
                </span>
              )}
            </div>
          </Link>
          <Link
            href="/menus/new"
            className={buttonVariants({ className: "w-full justify-center" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("sidebar.newMenu")}
          </Link>
        </div>
      }
    />
  );
}
