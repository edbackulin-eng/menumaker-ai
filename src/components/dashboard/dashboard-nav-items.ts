import { Coins, History, LayoutGrid, User } from "lucide-react";

import type { SidebarNavItem } from "@/components/shared/sidebar-nav";

/** Single source of truth for the Dashboard's navigation — shared by the desktop sidebar and the mobile bottom tab bar. */
export const DASHBOARD_NAV_ITEMS: Omit<SidebarNavItem, "active">[] = [
  { label: "Мої меню", href: "/dashboard", icon: LayoutGrid },
  { label: "Кредити", href: "/dashboard/credits", icon: Coins },
  { label: "Історія", href: "/dashboard/history", icon: History },
  { label: "Профіль", href: "/dashboard/profile", icon: User },
];
