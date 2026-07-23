"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi } from "@/lib/api-client/menus";
import { countRefreshableItems } from "@/services/photos/photo-provenance";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuContent } from "@/services/ai/schemas/menu-content";

export interface RefreshPhotosSectionProps {
  menuId: string;
  content: MenuContent;
}

/**
 * "Re-pick dish photos for this venue type" — the explicit action that
 * applies the venue-type photo motif chosen on the Template step.
 *
 * Explicit and confirmed, never automatic on venue-type change: it rewrites
 * photos the user can already see. The confirm dialog states the exact
 * counts, including how many of the owner's *own* uploads will be left
 * alone — the guarantee that matters most here, so it is spelled out rather
 * than implied.
 */
export function RefreshPhotosSection({ menuId, content }: RefreshPhotosSectionProps) {
  const t = useTranslations("menuGenerator.editor.refreshPhotos");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { replaceable, ownUploads } = countRefreshableItems(content.categories);

  async function handleConfirm() {
    setIsRunning(true);
    setError(null);
    try {
      const res = await menusApi.refreshStockPhotos(menuId);
      setResult(t("done", { replaced: res.replaced, kept: res.skippedOwnUploads }));
      setIsOpen(false);
      // Re-fetch the server component so the editor holds the new photo URLs.
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t("error"));
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-body-sm text-foreground font-medium">{t("heading")}</h3>
      <p className="text-caption text-foreground-secondary">{t("note")}</p>

      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setResult(null);
          setIsOpen(true);
        }}
        disabled={replaceable === 0}
      >
        {t("button")}
      </Button>

      {replaceable === 0 && (
        <p className="text-caption text-foreground-secondary">{t("nothingToRefresh")}</p>
      )}
      {result && <p className="text-caption text-success-600">{result}</p>}
      {error && <p className="text-caption text-error-600">{error}</p>}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmTitle")}</DialogTitle>
            <DialogDescription>{t("confirmBody", { replaceable, ownUploads })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isRunning}
            >
              {t("cancel")}
            </Button>
            <Button type="button" onClick={() => void handleConfirm()} isLoading={isRunning}>
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
