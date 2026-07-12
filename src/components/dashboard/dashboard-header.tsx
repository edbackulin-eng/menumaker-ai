"use client";

import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/features/auth/actions";

export interface DashboardHeaderProps {
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export function DashboardHeader({ fullName, email, avatarUrl }: DashboardHeaderProps) {
  const displayName = fullName ?? email;

  return (
    <header className="border-border bg-surface sticky top-0 z-10 flex h-14 items-center justify-end border-b px-4 lg:px-6">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus-visible:ring-ring/30 rounded-full focus-visible:ring-2 focus-visible:outline-none">
          <Avatar src={avatarUrl} name={displayName} size="sm" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <span className="text-foreground block truncate font-medium">{displayName}</span>
            <span className="text-foreground-tertiary block truncate font-normal">{email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <UserIcon className="size-4" aria-hidden="true" />
              Профіль
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => void signOutAction()}>
            <LogOut className="size-4" aria-hidden="true" />
            Вийти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
