"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi } from "@/lib/api-client/menus";
import type { ResolvedMenuStyle } from "@/lib/utils/resolve-menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { MenuStaticView } from "@/components/menu-render/menu-static-view";

export interface TemplateCard {
  id: string;
  slug: string;
  name: string;
  category: string;
  style: ResolvedMenuStyle;
}

export interface TemplateGalleryProps {
  menuId: string;
  templates: TemplateCard[];
  /** The menu's own confirmed content — rendered live inside each template card (Stage 13: "show me my actual menu in this style," not an abstract color swatch). */
  content: MenuContent;
}

// Same scaled-render trick as MenuCard's mini preview (see that file's
// comment) — a fixed generous source width scaled down via CSS transform,
// clipped by the card's own overflow-hidden.
const PREVIEW_SOURCE_WIDTH = 720;
const PREVIEW_SCALE = 0.34;

export function TemplateGallery({ menuId, templates, content }: TemplateGalleryProps) {
  const t = useTranslations("menuGenerator.template");
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPreviewableContent = content.categories.some((c) => c.items.length > 0);

  async function handleApply() {
    if (!selectedId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await menusApi.applyTemplate(menuId, selectedId);
      router.push(`/menus/${menuId}/editor`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t("applyError"));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {templates.map((template) => {
          const isSelected = selectedId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedId(template.id)}
              disabled={isSubmitting}
              className={cn(
                "border-border duration-fast group flex flex-col overflow-hidden rounded-lg border text-start transition-colors",
                isSelected && "ring-accent-400 ring-2 ring-offset-2",
              )}
            >
              <div className="bg-surface-secondary relative h-32 overflow-hidden">
                {hasPreviewableContent ? (
                  <div
                    className="pointer-events-none absolute top-0 left-0 origin-top-left"
                    style={{ width: PREVIEW_SOURCE_WIDTH, transform: `scale(${PREVIEW_SCALE})` }}
                    aria-hidden="true"
                  >
                    <MenuStaticView content={content} style={{ ...template.style, columns: 1 }} />
                  </div>
                ) : (
                  <div className="bg-surface-secondary absolute inset-0" />
                )}
                {isSelected && (
                  <span className="bg-accent-400 absolute end-2 top-2 z-10 flex size-6 items-center justify-center rounded-full text-white">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 p-3">
                <p className="text-body-sm font-medium">{template.name}</p>
                <Badge variant="neutral" className="w-fit">
                  {template.category === "cuisine" ? t("categoryCuisine") : t("categoryStyle")}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="border-error-400/30 bg-error-50 text-body-sm text-error-600 rounded-md border px-4 py-3">
          {error}
        </div>
      )}

      <Button
        type="button"
        onClick={handleApply}
        disabled={!selectedId}
        isLoading={isSubmitting}
        className="self-start"
      >
        {t("applyButton")}
      </Button>
    </div>
  );
}
