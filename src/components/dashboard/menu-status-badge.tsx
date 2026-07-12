import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { Tables } from "@/types/database.types";

const STATUS_LABEL: Record<Tables<"menus">["status"], string> = {
  draft: "Чернетка",
  processing: "Обробка",
  completed: "Завершено",
  failed: "Помилка",
};

const STATUS_VARIANT: Record<Tables<"menus">["status"], BadgeProps["variant"]> = {
  draft: "neutral",
  processing: "warning",
  completed: "success",
  failed: "error",
};

export interface MenuStatusBadgeProps {
  status: Tables<"menus">["status"];
  /**
   * Overrides the default (Ukrainian) label — used by the localized
   * dashboard (`MenuCard`, via `dashboard.statusBadge.*` translations).
   * Left unset, this renders the Ukrainian label unconditionally, which is
   * what the admin panel needs (it stays Ukrainian regardless of interface
   * locale and has no next-intl context available to it at all).
   */
  label?: string;
}

export function MenuStatusBadge({ status, label }: MenuStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{label ?? STATUS_LABEL[status]}</Badge>;
}
