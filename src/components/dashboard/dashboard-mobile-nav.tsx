"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { DASHBOARD_NAV_ITEMS } from "@/components/dashboard/dashboard-nav-items";

/**
 * Fixed bottom tab bar for small screens — chosen over a hamburger +
 * slide-out drawer: fewer taps for a flat 4-item nav, always visible (no
 * extra open/close state to manage), and a common pattern in minimal
 * dashboard UIs (Linear's mobile web, most iOS apps) that fits the brief's
 * "мінімалістичний стиль Apple/Stripe/Linear" ask. Hidden at `lg` and up,
 * where DashboardSidebar takes over.
 */
export function DashboardMobileNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      aria-label={t("ariaMain")}
      className="border-border bg-surface fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t lg:hidden"
    >
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-caption duration-fast flex flex-1 flex-col items-center gap-0.5 py-2 font-medium transition-colors",
              active
                ? "text-accent-600"
                : "text-foreground-tertiary hover:text-foreground-secondary",
            )}
          >
            {/* Same fixed per-destination colour as the desktop sidebar. */}
            {Icon && (
              <Icon className="size-5" style={{ color: item.iconColor }} aria-hidden="true" />
            )}
            {t(`items.${item.labelKey}`)}
          </Link>
        );
      })}
    </nav>
  );
}
