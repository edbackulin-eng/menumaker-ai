import {
  BarChart3,
  CreditCard,
  FileText,
  Gauge,
  LayoutTemplate,
  Users,
  Wallet,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { label: "Дашборд", href: "/admin", icon: Gauge },
  { label: "Користувачі", href: "/admin/users", icon: Users },
  { label: "Меню", href: "/admin/menus", icon: FileText },
  { label: "Платежі", href: "/admin/payments", icon: CreditCard },
  { label: "Кредити", href: "/admin/credits", icon: Wallet },
  { label: "Шаблони", href: "/admin/templates", icon: LayoutTemplate },
  { label: "Статистика", href: "/admin/statistics", icon: BarChart3 },
];
