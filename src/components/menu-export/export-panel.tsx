"use client";

import { Copy, Download, ExternalLink, QrCode } from "lucide-react";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi } from "@/lib/api-client/menus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export interface ExportPanelProps {
  menuId: string;
  appUrl: string;
  initialIsPublic: boolean;
  initialPublicSlug: string | null;
}

/** Forces a real download even for the cross-origin Supabase Storage URL — a plain `<a download>` is silently ignored by browsers for cross-origin targets, so the file is fetched as a blob first and downloaded from a same-origin blob: URL instead. */
async function downloadFile(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

export function ExportPanel({
  menuId,
  appUrl,
  initialIsPublic,
  initialPublicSlug,
}: ExportPanelProps) {
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [publicSlug, setPublicSlug] = useState(initialPublicSlug);
  const [slugInput, setSlugInput] = useState(initialPublicSlug ?? "");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);

  const publicUrl = publicSlug ? `${appUrl}/m/${publicSlug}` : null;

  async function handlePublish() {
    setPublishError(null);
    setIsPublishing(true);
    try {
      const menu = await menusApi.publish(menuId, slugInput.trim() || undefined);
      setIsPublic(true);
      setPublicSlug(menu.public_slug);
      setSlugInput(menu.public_slug ?? "");
      toast({
        variant: "success",
        title: "Опубліковано",
        description: "Web Menu тепер доступне за посиланням.",
      });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Не вдалося опублікувати меню.";
      setPublishError(message);
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleUnpublish() {
    setPublishError(null);
    setIsPublishing(true);
    try {
      await menusApi.unpublish(menuId);
      setIsPublic(false);
      toast({
        title: "Знято з публікації",
        description: "Посилання збережено — можете опублікувати знову будь-коли.",
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Не вдалося зняти меню з публікації.";
      setPublishError(message);
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleCopyLink() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    toast({ variant: "success", title: "Скопійовано", description: publicUrl });
  }

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    try {
      const { url } = await menusApi.exportPdf(menuId);
      await downloadFile(url, "menu.pdf");
    } catch (err) {
      toast({
        variant: "error",
        title: "Помилка",
        description: err instanceof ApiClientError ? err.message : "Не вдалося завантажити PDF.",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function handleDownloadPng() {
    setIsDownloadingPng(true);
    try {
      const { url } = await menusApi.exportPng(menuId);
      await downloadFile(url, "menu.png");
    } catch (err) {
      toast({
        variant: "error",
        title: "Помилка",
        description:
          err instanceof ApiClientError ? err.message : "Не вдалося завантажити зображення.",
      });
    } finally {
      setIsDownloadingPng(false);
    }
  }

  async function handleGenerateQr() {
    setIsGeneratingQr(true);
    try {
      const { url } = await menusApi.exportQr(menuId);
      setQrPreviewUrl(url);
    } catch (err) {
      toast({
        variant: "error",
        title: "Помилка",
        description: err instanceof ApiClientError ? err.message : "Не вдалося згенерувати QR-код.",
      });
    } finally {
      setIsGeneratingQr(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Web Menu
            {isPublic && <Badge variant="success">Опубліковано</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            label="Посилання (slug)"
            placeholder="napryklad-kavyarnya-lviv"
            value={slugInput}
            onChange={(event) => setSlugInput(event.target.value)}
            helperText="Латиниця, цифри, дефіси. Залиште порожнім, щоб згенерувати автоматично з назви."
          />
          {publishError && <p className="text-body-sm text-error-600">{publishError}</p>}

          <div className="flex flex-wrap items-center gap-3">
            {!isPublic ? (
              <Button type="button" isLoading={isPublishing} onClick={() => void handlePublish()}>
                Опублікувати
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={isPublishing}
                  onClick={() => void handleUnpublish()}
                >
                  Зняти з публікації
                </Button>
                {slugInput !== publicSlug && (
                  <Button
                    type="button"
                    variant="secondary"
                    isLoading={isPublishing}
                    onClick={() => void handlePublish()}
                  >
                    Змінити посилання
                  </Button>
                )}
              </>
            )}
          </div>

          {isPublic && publicUrl && (
            <div className="border-border bg-surface-secondary flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-body-sm text-accent-600 flex min-w-0 items-center gap-1.5 truncate font-medium underline underline-offset-2"
                >
                  <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{publicUrl}</span>
                </a>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleCopyLink()}
                >
                  <Copy className="size-4" aria-hidden="true" />
                  Скопіювати
                </Button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={isGeneratingQr}
                  onClick={() => void handleGenerateQr()}
                >
                  <QrCode className="size-4" aria-hidden="true" />
                  Згенерувати QR-код
                </Button>
                {qrPreviewUrl && (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL, not a local/optimizable asset */}
                    <img
                      src={qrPreviewUrl}
                      alt="QR-код на меню"
                      className="border-border size-20 rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void downloadFile(qrPreviewUrl, "menu-qr.png")}
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Завантажити QR
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Завантажити файли</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            isLoading={isDownloadingPdf}
            onClick={() => void handleDownloadPdf()}
          >
            <Download className="size-4" aria-hidden="true" />
            Завантажити PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            isLoading={isDownloadingPng}
            onClick={() => void handleDownloadPng()}
          >
            <Download className="size-4" aria-hidden="true" />
            Завантажити PNG
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
