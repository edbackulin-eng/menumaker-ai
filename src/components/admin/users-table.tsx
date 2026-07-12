"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { GrantCreditsModal } from "@/components/admin/grant-credits-modal";
import { RoleChangeModal } from "@/components/admin/role-change-modal";
import type { AdminUserRow } from "@/lib/api-client/admin";

const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export interface UsersTableProps {
  users: AdminUserRow[];
  currentAdminId: string;
}

export function UsersTable({ users, currentAdminId }: UsersTableProps) {
  const [roleModalUser, setRoleModalUser] = useState<AdminUserRow | null>(null);
  const [creditsModalUser, setCreditsModalUser] = useState<AdminUserRow | null>(null);

  if (users.length === 0) {
    return (
      <EmptyState
        title="Користувачів не знайдено"
        description="Спробуйте змінити параметри пошуку."
      />
    );
  }

  return (
    <>
      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full text-left">
          <thead className="bg-surface-secondary text-caption text-foreground-tertiary">
            <tr>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Ім&apos;я</th>
              <th className="px-4 py-2.5 font-medium">Реєстрація</th>
              <th className="px-4 py-2.5 font-medium">Роль</th>
              <th className="px-4 py-2.5 font-medium">Спроба</th>
              <th className="px-4 py-2.5 font-medium">Кредити</th>
              <th className="px-4 py-2.5 font-medium">Меню</th>
              <th className="px-4 py-2.5 font-medium">
                <span className="sr-only">Дії</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {users.map((user) => (
              <tr key={user.id} data-testid="admin-user-row" data-user-id={user.id}>
                <td className="text-body-sm text-foreground px-4 py-3 font-medium">{user.email}</td>
                <td className="text-body-sm text-foreground-secondary px-4 py-3">
                  {user.full_name ?? "—"}
                </td>
                <td className="text-body-sm text-foreground-secondary px-4 py-3">
                  {dateFormatter.format(new Date(user.created_at))}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === "admin" ? "accent" : "neutral"}>
                    {user.role === "admin" ? "Адмін" : "Користувач"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.free_menus_used > 0 ? "success" : "neutral"}>
                    {user.free_menus_used > 0 ? "Використано" : "Доступна"}
                  </Badge>
                </td>
                <td className="text-body-sm text-foreground px-4 py-3">{user.credits_balance}</td>
                <td className="text-body-sm text-foreground px-4 py-3">{user.menu_count}</td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Дії з користувачем"
                      className="text-foreground-tertiary hover:bg-surface-secondary hover:text-foreground focus-visible:ring-ring/30 -m-1 flex size-7 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <MoreVertical className="size-4" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={user.id === currentAdminId}
                        onSelect={() => setRoleModalUser(user)}
                      >
                        Змінити роль
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setCreditsModalUser(user)}>
                        Нарахувати кредити
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {roleModalUser && (
        <RoleChangeModal
          open={Boolean(roleModalUser)}
          onOpenChange={(open) => !open && setRoleModalUser(null)}
          userId={roleModalUser.id}
          userLabel={roleModalUser.email}
          currentRole={roleModalUser.role}
        />
      )}
      {creditsModalUser && (
        <GrantCreditsModal
          open={Boolean(creditsModalUser)}
          onOpenChange={(open) => !open && setCreditsModalUser(null)}
          userId={creditsModalUser.id}
          userLabel={creditsModalUser.email}
        />
      )}
    </>
  );
}
