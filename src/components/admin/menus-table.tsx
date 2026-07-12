import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { MenuStatusBadge } from "@/components/dashboard/menu-status-badge";
import type { AdminMenuRow } from "@/lib/api-client/admin";

const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function templateLabel(name: unknown): string {
  if (name && typeof name === "object" && !Array.isArray(name)) {
    const record = name as Record<string, unknown>;
    const value = record.uk ?? record.en;
    if (typeof value === "string") return value;
  }
  return "—";
}

export interface MenusTableProps {
  menus: AdminMenuRow[];
}

export function MenusTable({ menus }: MenusTableProps) {
  if (menus.length === 0) {
    return <EmptyState title="Меню не знайдено" description="Спробуйте змінити фільтр статусу." />;
  }

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full text-left">
        <thead className="bg-surface-secondary text-caption text-foreground-tertiary">
          <tr>
            <th className="px-4 py-2.5 font-medium">Назва</th>
            <th className="px-4 py-2.5 font-medium">Власник</th>
            <th className="px-4 py-2.5 font-medium">Статус</th>
            <th className="px-4 py-2.5 font-medium">Шаблон</th>
            <th className="px-4 py-2.5 font-medium">Створено</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {menus.map((menu) => (
            <tr key={menu.id}>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/menus/${menu.id}`}
                  className="text-body-sm text-accent-600 font-medium underline underline-offset-2"
                >
                  {menu.title}
                </Link>
              </td>
              <td className="text-body-sm text-foreground-secondary px-4 py-3">
                {menu.owner_email}
              </td>
              <td className="px-4 py-3">
                <MenuStatusBadge status={menu.status} />
              </td>
              <td className="text-body-sm text-foreground-secondary px-4 py-3">
                {templateLabel(menu.template_name)}
              </td>
              <td className="text-body-sm text-foreground-secondary px-4 py-3">
                {dateFormatter.format(new Date(menu.created_at))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
