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

export function MenuStatusBadge({ status }: { status: Tables<"menus">["status"] }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
