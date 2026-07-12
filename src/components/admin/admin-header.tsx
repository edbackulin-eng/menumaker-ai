"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/features/auth/actions";

export interface AdminHeaderProps {
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export function AdminHeader({ fullName, email, avatarUrl }: AdminHeaderProps) {
  const displayName = fullName ?? email;

  return (
    <header className="border-border bg-surface sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 lg:px-6">
      <Badge variant="warning" className="tracking-wide uppercase">
        Admin
      </Badge>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-body-sm text-foreground-secondary hover:text-foreground flex items-center gap-1.5 font-medium"
        >
          <LayoutDashboard className="size-4" aria-hidden="true" />
          Мій кабінет
        </Link>
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
            <DropdownMenuItem destructive onSelect={() => void signOutAction()}>
              <LogOut className="size-4" aria-hidden="true" />
              Вийти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
