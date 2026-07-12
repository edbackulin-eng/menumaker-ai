"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Copy, ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { getAccentColorHex, type AccentColorId } from "@/config/menu-style";
import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi, type Menu } from "@/lib/api-client/menus";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuStatusBadge } from "@/components/dashboard/menu-status-badge";

export interface MenuCardProps {
  menu: Menu;
  accentColorId: AccentColorId;
  fontLabel: string;
}

export function MenuCard({ menu, accentColorId, fontLabel }: MenuCardProps) {
  const t = useTranslations("dashboard.menuCard");
  const tButtons = useTranslations("common.buttons");
  const tStatus = useTranslations("dashboard.statusBadge");
  const format = useFormatter();
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accentHex = getAccentColorHex(accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);
  const canEdit = menu.status === "draft" || menu.status === "completed";
  const canDuplicate = menu.status === "completed";

  async function handleDuplicate() {
    setError(null);
    setIsDuplicating(true);
    try {
      await menusApi.duplicate(menu.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t("duplicateError"));
    } finally {
      setIsDuplicating(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      await menusApi.remove(menu.id);
      setIsDeleteOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t("deleteError"));
      setIsDeleting(false);
    }
  }

  return (
    <div
      data-testid="menu-card"
      data-menu-id={menu.id}
      className="border-border bg-surface flex flex-col overflow-hidden rounded-lg border"
    >
      <div
        className="flex h-28 flex-col justify-end gap-1.5 p-4"
        style={{ backgroundColor: accentHex, color: accentTextHex }}
      >
        <div className="h-1.5 w-2/3 rounded-full bg-current opacity-80" />
        <div className="h-1.5 w-1/2 rounded-full bg-current opacity-50" />
        <div className="h-1.5 w-2/5 rounded-full bg-current opacity-30" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p
            data-testid="menu-card-title"
            className="text-body truncate font-medium"
            title={menu.title}
          >
            {menu.title}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={t("actionsAria")}
              className="text-foreground-tertiary hover:bg-surface-secondary hover:text-foreground focus-visible:ring-ring/30 -m-1 flex size-7 shrink-0 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/menus/${menu.id}/editor`}>
                    <Pencil className="size-4" aria-hidden="true" />
                    {t("editLabel")}
                  </Link>
                </DropdownMenuItem>
              )}
              {canDuplicate && (
                <DropdownMenuItem onSelect={() => void handleDuplicate()} disabled={isDuplicating}>
                  <Copy className="size-4" aria-hidden="true" />
                  {t("duplicateLabel")}
                </DropdownMenuItem>
              )}
              {menu.is_public && menu.public_slug && (
                <DropdownMenuItem asChild>
                  <a href={`/m/${menu.public_slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" aria-hidden="true" />
                    {t("publicLink")}
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => setIsDeleteOpen(true)}>
                <Trash2 className="size-4" aria-hidden="true" />
                {t("deleteLabel")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between gap-2">
          <MenuStatusBadge status={menu.status} label={tStatus(menu.status)} />
          <span className="text-caption text-foreground-tertiary">{fontLabel}</span>
        </div>

        <p className="text-caption text-foreground-tertiary mt-auto">
          {t("updatedPrefix")}{" "}
          {format.dateTime(new Date(menu.updated_at), {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        {error && <p className="text-caption text-error-600">{error}</p>}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialogTitle", { title: menu.title })}</DialogTitle>
            <DialogDescription>{t("deleteDialogDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              {tButtons("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              isLoading={isDeleting}
            >
              {tButtons("deleteForever")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
