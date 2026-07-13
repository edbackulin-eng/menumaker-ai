"use client";

import { useTranslations } from "next-intl";
import { Copy, Download, ExternalLink, QrCode } from "lucide-react";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi } from "@/lib/api-client/menus";
import { slugify } from "@/lib/utils/slug";
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
  const t = useTranslations("export");
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

  /** Shared by handlePublish (explicit "Publish" click, wants its own toast) and handleGenerateQr (publishes silently as an implementation step — see that function's comment). */
  async function publishMenu() {
    const menu = await menusApi.publish(menuId, slugInput.trim() || undefined);
    setIsPublic(true);
    setPublicSlug(menu.public_slug);
    setSlugInput(menu.public_slug ?? "");
    return menu;
  }

  async function handlePublish() {
    setPublishError(null);
    setIsPublishing(true);
    try {
      await publishMenu();
      toast({
        variant: "success",
        title: t("toasts.publishedTitle"),
        description: t("toasts.publishedDescription"),
      });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : t("toasts.errorPublish");
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
        title: t("toasts.unpublishedTitle"),
        description: t("toasts.unpublishedDescription"),
      });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : t("toasts.errorUnpublish");
      setPublishError(message);
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleCopyLink() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    toast({ variant: "success", title: t("toasts.copiedTitle"), description: publicUrl });
  }

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    try {
      const { url } = await menusApi.exportPdf(menuId);
      await downloadFile(url, "menu.pdf");
    } catch (err) {
      toast({
        variant: "error",
        title: t("toasts.errorTitle"),
        description: err instanceof ApiClientError ? err.message : t("toasts.errorPdf"),
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
        title: t("toasts.errorTitle"),
        description: err instanceof ApiClientError ? err.message : t("toasts.errorPng"),
      });
    } finally {
      setIsDownloadingPng(false);
    }
  }

  // QR *technically* requires a published public URL to encode, but making
  // the user run a separate "Publish" step first before this button even
  // does anything was pure friction — the sequencing is an implementation
  // detail, not something the user should have to understand. Publishing
  // here is silent (no toast) specifically so it doesn't compete with the
  // QR image itself as the visible confirmation of "this worked"; the
  // Web Menu card above still updates to its published state (badge, URL,
  // Unpublish button) as a side effect, which is enough of a trace for
  // anyone who goes looking for it.
  async function handleGenerateQr() {
    setIsGeneratingQr(true);
    setPublishError(null);
    try {
      if (!isPublic) {
        await publishMenu();
      }
      const { url } = await menusApi.exportQr(menuId);
      setQrPreviewUrl(url);
    } catch (err) {
      toast({
        variant: "error",
        title: t("toasts.errorTitle"),
        description: err instanceof ApiClientError ? err.message : t("toasts.errorQr"),
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
            {t("webMenuTitle")}
            {isPublic && <Badge variant="success">{t("published")}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            label={t("slugLabel")}
            placeholder="napryklad-kavyarnya-lviv"
            value={slugInput}
            onChange={(event) => setSlugInput(event.target.value)}
            // Normalizes on blur rather than on every keystroke — kebab-
            // casing a Cyrillic paste mid-type would otherwise fight the
            // cursor position. This is what actually fixes "field shows
            // raw Cyrillic that contradicts its own Latin-only hint": the
            // field re-derives a valid slug the moment the user leaves it,
            // instead of leaving invalid text sitting there for them to
            // manually retype.
            onBlur={(event) => {
              const normalized = slugify(event.target.value);
              if (normalized !== event.target.value) setSlugInput(normalized);
            }}
            helperText={t("slugHelper")}
          />
          {publishError && <p className="text-body-sm text-error-600">{publishError}</p>}

          <div className="flex flex-wrap items-center gap-3">
            {!isPublic ? (
              <Button type="button" isLoading={isPublishing} onClick={() => void handlePublish()}>
                {t("publish")}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={isPublishing}
                  onClick={() => void handleUnpublish()}
                >
                  {t("unpublish")}
                </Button>
                {slugInput !== publicSlug && (
                  <Button
                    type="button"
                    variant="secondary"
                    isLoading={isPublishing}
                    onClick={() => void handlePublish()}
                  >
                    {t("changeLink")}
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
                  {t("copyLink")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/*
        QR generation *technically* requires a published public URL to
        encode — handleGenerateQr publishes the menu first (silently) if
        it isn't already, so this card never needs to explain that
        sequencing or gate the button on it. Always visible, always
        enabled, next to PDF/PNG as an equal peer.
      */}
      <Card>
        <CardHeader>
          <CardTitle>{t("qrCardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              isLoading={isGeneratingQr}
              onClick={() => void handleGenerateQr()}
            >
              <QrCode className="size-4" aria-hidden="true" />
              {t("generateQr")}
            </Button>
            {qrPreviewUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL, not a local/optimizable asset */}
                <img
                  src={qrPreviewUrl}
                  alt={t("qrAlt")}
                  className="border-border size-20 rounded-md border"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void downloadFile(qrPreviewUrl, "menu-qr.png")}
                >
                  <Download className="size-4" aria-hidden="true" />
                  {t("downloadQr")}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("downloadFilesTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            isLoading={isDownloadingPdf}
            onClick={() => void handleDownloadPdf()}
          >
            <Download className="size-4" aria-hidden="true" />
            {t("downloadPdf")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            isLoading={isDownloadingPng}
            onClick={() => void handleDownloadPng()}
          >
            <Download className="size-4" aria-hidden="true" />
            {t("downloadPng")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
