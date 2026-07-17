import { Coins, History, LayoutGrid, User, type LucideIcon } from "lucide-react";

export interface DashboardNavItemDef {
  labelKey: "myMenus" | "credits" | "history" | "profile";
  href: string;
  icon: LucideIcon;
  /** Fixed per destination. Literal hex rather than a design token on purpose: these are wayfinding colours belonging to the nav, not palette roles anything else reuses, and putting them in globals.css would imply otherwise. */
  iconColor: string;
}

/**
 * Single source of truth for the Dashboard's navigation — shared by the
 * desktop sidebar and the mobile bottom tab bar. `labelKey` resolves against
 * the `nav.items` translation namespace at render time (see
 * DashboardSidebar/DashboardMobileNav).
 *
 * Four items, not the five in the Stage 14 mockup: the mockup's "Templates"
 * entry has no page behind it, and a nav item that leads nowhere is worse
 * than its absence (agreed with the Product Owner). Its colour is
 * deliberately not defined anywhere until that page exists.
 */
export const DASHBOARD_NAV_ITEMS: DashboardNavItemDef[] = [
  { labelKey: "myMenus", href: "/dashboard", icon: LayoutGrid, iconColor: "#818cf8" },
  { labelKey: "credits", href: "/dashboard/credits", icon: Coins, iconColor: "#f472b6" },
  { labelKey: "history", href: "/dashboard/history", icon: History, iconColor: "#f59e0b" },
  { labelKey: "profile", href: "/dashboard/profile", icon: User, iconColor: "#60a5fa" },
];
