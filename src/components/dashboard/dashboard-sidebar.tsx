"use client";

import { useTranslations } from "next-intl";
import { Plus, UtensilsCrossed } from "lucide-react";

import type { CreditBlock } from "@/services/dashboard/get-summary";
import { Link, usePathname } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { DASHBOARD_NAV_ITEMS } from "@/components/dashboard/dashboard-nav-items";
import { SidebarCreditsBlock } from "@/components/dashboard/sidebar-credits-block";

export interface DashboardSidebarProps {
  creditBlock: CreditBlock;
}

/** Desktop-only (see DashboardMobileNav for the small-screen equivalent) — hidden below `lg`. */
export function DashboardSidebar({ creditBlock }: DashboardSidebarProps) {
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
      className="bg-sidebar sticky top-0 hidden h-screen lg:flex"
      header={
        <div className="flex flex-col gap-3 pb-3">
          <div className="flex items-center gap-2 px-1 py-0.5">
            <span className="bg-accent-500 flex size-7 shrink-0 items-center justify-center rounded-[7px]">
              <UtensilsCrossed className="size-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-body-sm text-foreground font-semibold">
              MenuMaker <span className="text-accent-400">AI</span>
            </span>
          </div>
          <Link
            href="/menus/new"
            className={buttonVariants({ className: "h-9 w-full justify-center" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("sidebar.newMenu")}
          </Link>
        </div>
      }
      footer={<SidebarCreditsBlock block={creditBlock} />}
    />
  );
}
