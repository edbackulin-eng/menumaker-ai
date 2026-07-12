"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export interface UsersFilterBarProps {
  initialSearch: string;
  initialRole: string;
}

const ROLE_OPTIONS = [
  { value: "all", label: "Усі ролі" },
  { value: "user", label: "Користувач" },
  { value: "admin", label: "Адміністратор" },
];

export function UsersFilterBar({ initialSearch, initialRole }: UsersFilterBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  function buildUrl(nextSearch: string, nextRole: string) {
    const params = new URLSearchParams();
    if (nextSearch) params.set("search", nextSearch);
    if (nextRole !== "all") params.set("role", nextRole);
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildUrl(search, initialRole));
  }

  function handleRoleChange(role: string) {
    router.push(buildUrl(search, role));
  }

  return (
    <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Input
        label="Пошук"
        placeholder="Email або ім'я"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        leftIcon={<Search />}
        containerClassName="sm:w-72"
      />
      <Select
        label="Роль"
        options={ROLE_OPTIONS}
        value={initialRole}
        onValueChange={handleRoleChange}
        containerClassName="sm:w-48"
      />
    </form>
  );
}
