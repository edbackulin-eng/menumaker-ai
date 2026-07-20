"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useState } from "react";

import {
  BUSINESS_TYPES,
  DEFAULT_BUSINESS_TYPE,
  isBusinessType,
  type BusinessType,
} from "@/config/business-type";
import { getAccentColorHex } from "@/config/menu-style";
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
  /** Venue-type tabs this template appears under (menu_templates.business_types). */
  businessTypes: string[];
  style: ResolvedMenuStyle;
}

export interface TemplateGalleryProps {
  menuId: string;
  templates: TemplateCard[];
  /** The menu's own confirmed content — rendered live inside each template card (Stage 13: "show me my actual menu in this style," not an abstract color swatch). */
  content: MenuContent;
  /** `menus.business_type` — null when the user hasn't picked a tab yet. */
  initialBusinessType: string | null;
}

// Same scaled-render trick as MenuCard's mini preview (see that file's
// comment) — a fixed generous source width scaled down via CSS transform,
// clipped by the card's own overflow-hidden.
const PREVIEW_SOURCE_WIDTH = 720;
const PREVIEW_SCALE = 0.34;

// A template's page-background gradient is often a light pastel (Coffee
// Shop's cream, Restaurant's off-white, ...) — genuinely different colors
// from each other, but too close to the surrounding page's own white to
// read as visually distinct once scaled down to a ~150px-tall card (PO
// feedback: 9 of 12 cards looked interchangeable, only the 3 dark
// templates stood out). A 2px border in the template's own accent color
// gives every card a guaranteed, immediately-legible identifier that
// doesn't depend on how saturated that particular template's background
// happens to be.
const CARD_BORDER_WIDTH = 2;

export function TemplateGallery({
  menuId,
  templates,
  content,
  initialBusinessType,
}: TemplateGalleryProps) {
  const t = useTranslations("menuGenerator.template");
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The active tab is a *view* first: it defaults to the menu's saved type,
  // or the first type as a starting view when none is saved. It is only
  // written to the menu when the user actually clicks a tab (or applies a
  // template), so `business_type` stays NULL until a real choice is made.
  const [activeType, setActiveType] = useState<BusinessType>(
    initialBusinessType && isBusinessType(initialBusinessType)
      ? initialBusinessType
      : DEFAULT_BUSINESS_TYPE,
  );

  const hasPreviewableContent = content.categories.some((c) => c.items.length > 0);

  const visibleTemplates = templates.filter((template) =>
    template.businessTypes.includes(activeType),
  );

  function handleTabChange(type: BusinessType) {
    if (type === activeType) return;
    setActiveType(type);
    // If the selected template isn't offered under the new tab, clear it so
    // the user can't apply a template they can no longer see.
    setSelectedId((current) =>
      current && templates.find((tpl) => tpl.id === current)?.businessTypes.includes(type)
        ? current
        : null,
    );
    // Persist the choice. Fire-and-forget: the tab is a filter, and a failed
    // save must not block browsing — the value is re-sent on apply anyway.
    void menusApi.update(menuId, { business_type: type }).catch(() => {});
  }

  async function handleApply() {
    if (!selectedId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      // Persist the venue type together with proceeding, so a user who
      // never clicked a tab (browsed the default view and applied) still
      // ends the step with a real `business_type`, not NULL.
      await menusApi.update(menuId, { business_type: activeType });
      await menusApi.applyTemplate(menuId, selectedId);
      router.push(`/menus/${menuId}/editor`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t("applyError"));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label={t("venueTypeLabel")}
        className="border-border flex flex-wrap gap-1 border-b"
      >
        {BUSINESS_TYPES.map((type) => {
          const isActive = type.id === activeType;
          return (
            <button
              key={type.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(type.id)}
              className={cn(
                "duration-fast text-body-sm -mb-px border-b-2 px-3 py-2 font-medium transition-colors",
                isActive
                  ? "border-accent-500 text-accent-700"
                  : "text-foreground-secondary hover:text-foreground border-transparent",
              )}
            >
              {t(`venueType.${type.labelKey}`)}
            </button>
          );
        })}
      </div>

      {visibleTemplates.length === 0 ? (
        <p className="text-body-sm text-foreground-secondary py-8 text-center">
          {t("noTemplatesForType")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleTemplates.map((template) => {
            const isSelected = selectedId === template.id;
            const accentHex = getAccentColorHex(template.style.accentColorId);
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedId(template.id)}
                disabled={isSubmitting}
                style={{ borderColor: accentHex, borderWidth: CARD_BORDER_WIDTH }}
                className={cn(
                  "duration-fast group flex flex-col overflow-hidden rounded-lg border text-start transition-colors",
                  isSelected && "ring-accent-400 ring-2 ring-offset-2",
                )}
              >
                <div className="bg-surface-secondary relative h-36 overflow-hidden">
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
      )}

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
