"use client";

import { useFormatter, useNow, useTranslations } from "next-intl";
import { Copy, ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { getAccentColorHex } from "@/config/menu-style";
import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi, type Menu } from "@/lib/api-client/menus";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import type { ResolvedMenuStyle } from "@/lib/utils/resolve-menu-style";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";
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
import { MenuStaticView } from "@/components/menu-render/menu-static-view";

export interface MenuCardProps {
  menu: Menu;
  style: ResolvedMenuStyle;
  /** Shown in the card's meta line ("Modern · updated 2h ago"). Resolved server-side against the menu's content locale. */
  templateName: string;
}

// Rendered at a fixed, generously-wide size and scaled down via CSS
// transform — the same trick design tools use for "live" thumbnails,
// simplest reliable way to get a real preview of arbitrary-length menu
// content into a fixed-height card without measuring anything. The source
// width is intentionally wider than any card so the clipped viewport
// (`overflow-hidden` on the wrapper) never shows empty space on the right.
const PREVIEW_SOURCE_WIDTH = 860;
const PREVIEW_SCALE = 0.34;

/** A card with no recognizable content yet (still processing, or a bare draft) falls back to this instead of an empty preview box. */
function PreviewPlaceholder({
  accentHex,
  accentTextHex,
}: {
  accentHex: string;
  accentTextHex: string;
}) {
  return (
    <div
      className="flex h-full flex-col justify-end gap-1.5 p-4"
      style={{ backgroundColor: accentHex, color: accentTextHex }}
    >
      <div className="h-1.5 w-2/3 rounded-full bg-current opacity-80" />
      <div className="h-1.5 w-1/2 rounded-full bg-current opacity-50" />
      <div className="h-1.5 w-2/5 rounded-full bg-current opacity-30" />
    </div>
  );
}

export function MenuCard({ menu, style, templateName }: MenuCardProps) {
  const t = useTranslations("dashboard.menuCard");
  const tButtons = useTranslations("common.buttons");
  const tStatus = useTranslations("dashboard.statusBadge");
  const format = useFormatter();
  // `relativeTime` needs an explicit reference point; without one next-intl
  // throws ENVIRONMENT_FALLBACK and the meta line renders empty. `useNow()`
  // supplies a value that's stable between server and client render, so this
  // doesn't cause a hydration mismatch the way `new Date()` inline would.
  const now = useNow();
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accentHex = getAccentColorHex(style.accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);
  const canEdit = menu.status === "draft" || menu.status === "completed";
  const canDuplicate = menu.status === "completed";

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const hasPreviewableContent =
    parsedContent.success && parsedContent.data.categories.some((c) => c.items.length > 0);

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
      className="border-border bg-surface hover:border-border-strong duration-fast flex flex-col overflow-hidden rounded-lg border transition-colors"
    >
      <div className="bg-surface-secondary relative h-[78px] overflow-hidden">
        {hasPreviewableContent ? (
          <div
            className="pointer-events-none absolute top-0 left-0 origin-top-left"
            style={{ width: PREVIEW_SOURCE_WIDTH, transform: `scale(${PREVIEW_SCALE})` }}
            aria-hidden="true"
          >
            <MenuStaticView content={parsedContent.data} style={{ ...style, columns: 1 }} />
          </div>
        ) : (
          <PreviewPlaceholder accentHex={accentHex} accentTextHex={accentTextHex} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <div className="flex items-start justify-between gap-2">
          <p
            data-testid="menu-card-title"
            className="truncate text-[13px] leading-5 font-medium"
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

        {/*
          "{template} · updated {relative}" per the mockup — the template name
          says more about what the card *is* than the old font label did, and a
          relative time ("2h ago") is what you actually want to know when
          scanning a list. `format.relativeTime` is locale-aware via next-intl.
        */}
        <p className="text-foreground-secondary mt-0.5 truncate text-[11px] leading-4">
          {templateName} · {t("updatedPrefix")}{" "}
          {format.relativeTime(new Date(menu.updated_at), now)}
        </p>

        {menu.status !== "completed" && (
          <div className="mt-1.5">
            <MenuStatusBadge status={menu.status} label={tStatus(menu.status)} />
          </div>
        )}

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
