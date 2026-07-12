import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { AdminUserRow } from "@/lib/api-client/admin";

const dateTimeFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export interface RecentRegistrationsListProps {
  users: AdminUserRow[];
}

export function RecentRegistrationsList({ users }: RecentRegistrationsListProps) {
  if (users.length === 0) {
    return (
      <EmptyState title="Ще немає реєстрацій" description="Нові користувачі з'являться тут." />
    );
  }

  return (
    <ul className="border-border divide-border divide-y rounded-lg border">
      {users.map((user) => (
        <li key={user.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-body-sm text-foreground truncate font-medium">
              {user.full_name ?? user.email}
            </p>
            <p className="text-caption text-foreground-tertiary truncate">
              {user.email} · {dateTimeFormatter.format(new Date(user.created_at))}
            </p>
          </div>
          <Badge variant={user.free_menus_used > 0 ? "success" : "neutral"} className="shrink-0">
            {user.free_menus_used > 0 ? "Спробу використано" : "Спроба доступна"}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
