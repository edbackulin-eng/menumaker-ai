"use client";

import { useRouter } from "next/navigation";

import { Select } from "@/components/ui/select";

export interface MenusFilterBarProps {
  initialStatus: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Усі статуси" },
  { value: "draft", label: "Чернетка" },
  { value: "processing", label: "Обробка" },
  { value: "completed", label: "Завершено" },
  { value: "failed", label: "Помилка" },
];

export function MenusFilterBar({ initialStatus }: MenusFilterBarProps) {
  const router = useRouter();

  function handleStatusChange(status: string) {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    const qs = params.toString();
    router.push(`/admin/menus${qs ? `?${qs}` : ""}`);
  }

  return (
    <Select
      label="Статус"
      options={STATUS_OPTIONS}
      value={initialStatus}
      onValueChange={handleStatusChange}
      containerClassName="sm:w-56"
    />
  );
}
