import { Coins, History, LayoutGrid, User, type LucideIcon } from "lucide-react";

export interface DashboardNavItemDef {
  labelKey: "myMenus" | "credits" | "history" | "profile";
  href: string;
  icon: LucideIcon;
}

/** Single source of truth for the Dashboard's navigation — shared by the desktop sidebar and the mobile bottom tab bar. `labelKey` resolves against the `nav.items` translation namespace at render time (see DashboardSidebar/DashboardMobileNav). */
export const DASHBOARD_NAV_ITEMS: DashboardNavItemDef[] = [
  { labelKey: "myMenus", href: "/dashboard", icon: LayoutGrid },
  { labelKey: "credits", href: "/dashboard/credits", icon: Coins },
  { labelKey: "history", href: "/dashboard/history", icon: History },
  { labelKey: "profile", href: "/dashboard/profile", icon: User },
];
