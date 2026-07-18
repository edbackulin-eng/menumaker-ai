"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

import { PHOTO_CONFIG } from "@/config/photos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PhotoSearchResult } from "@/services/photos/types";

export interface PhotoPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: PhotoSearchResult[];
  loading: boolean;
  selecting: boolean;
  selectedPhotoUrl?: string;
  onSelect: (candidate: PhotoSearchResult) => void;
}

/**
 * The grid a user picks a dish photo from — 5 at a time
 * (PHOTO_CONFIG.gridPageSize), "Показати ще" paging through the rest of
 * `candidates` (already fully fetched by the caller in one Pexels call;
 * see find-dish-photo.ts) with zero further requests, not even to our own
 * backend. Attribution lives here and only here — never on the rendered
 * menu, PDF, PNG, or `/m/[slug]` — per the Stage 2 plan's Pexels licensing
 * decision.
 */
export function PhotoPickerDialog({
  open,
  onOpenChange,
  candidates,
  loading,
  selecting,
  selectedPhotoUrl,
  onSelect,
}: PhotoPickerDialogProps) {
  const t = useTranslations("menuGenerator.review");
  const [visibleCount, setVisibleCount] = useState<number>(PHOTO_CONFIG.gridPageSize);

  // Reset paging whenever a fresh candidate list arrives (a different item's
  // grid, or the same item searched again) — otherwise a previously opened
  // grid's "show more" progress would leak into the next one. Adjusting
  // state during render (not in an effect) is the React-recommended way to
  // reset state in response to a prop change — see "you might not need an
  // effect" in the React docs.
  const [renderedCandidates, setRenderedCandidates] = useState(candidates);
  if (candidates !== renderedCandidates) {
    setRenderedCandidates(candidates);
    setVisibleCount(PHOTO_CONFIG.gridPageSize);
  }

  const visible = candidates.slice(0, visibleCount);
  const hasMore = visibleCount < candidates.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("photoPickerTitle")}</DialogTitle>
        </DialogHeader>

        {loading && (
          <p className="text-body-sm text-foreground-secondary py-8 text-center">
            {t("photoPickerLoading")}
          </p>
        )}

        {!loading && candidates.length === 0 && (
          <p className="text-body-sm text-foreground-secondary py-8 text-center">
            {t("photoPickerEmpty")}
          </p>
        )}

        {!loading && candidates.length > 0 && (
          <>
            <div className="grid grid-cols-5 gap-2" data-testid="photo-picker-grid">
              {visible.map((candidate) => {
                const isSelected = candidate.photoUrl === selectedPhotoUrl;
                return (
                  <button
                    key={candidate.externalId ?? candidate.thumbUrl}
                    type="button"
                    onClick={() => onSelect(candidate)}
                    disabled={selecting}
                    data-testid="photo-picker-candidate"
                    data-selected={isSelected}
                    className="border-border focus-visible:ring-ring/30 relative aspect-square overflow-hidden rounded-md border focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- external Pexels thumbnail URL, not a local/optimizable asset */}
                    <img
                      src={candidate.thumbUrl}
                      alt=""
                      className="size-full object-cover"
                      style={{ objectFit: "cover" }}
                    />
                    {isSelected && (
                      <span className="bg-accent-600 absolute end-1 top-1 flex size-5 items-center justify-center rounded-full text-white">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {hasMore && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3 self-start"
                onClick={() => setVisibleCount((count) => count + PHOTO_CONFIG.gridPageSize)}
              >
                {t("showMorePhotos")}
              </Button>
            )}

            <p className="text-caption text-foreground-tertiary mt-4">
              {t("photoAttributionPrefix")}{" "}
              <a
                href="https://www.pexels.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Pexels
              </a>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
