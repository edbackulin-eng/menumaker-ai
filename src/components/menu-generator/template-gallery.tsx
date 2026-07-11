"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi } from "@/lib/api-client/menus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface TemplateCard {
  id: string;
  slug: string;
  name: string;
  category: string;
}

export interface TemplateGalleryProps {
  menuId: string;
  templates: TemplateCard[];
}

/**
 * Placeholder swatch per template slug — real per-template visual design
 * (colors/fonts/layout) is out of scope for this stage (the future
 * drag-and-drop style editor); this only needs to look like a distinct,
 * selectable card.
 */
const SWATCH_CLASSES: Record<string, string> = {
  "coffee-shop": "bg-gradient-to-br from-amber-700 to-amber-950",
  restaurant: "bg-gradient-to-br from-red-700 to-red-950",
  pizza: "bg-gradient-to-br from-orange-500 to-red-700",
  sushi: "bg-gradient-to-br from-rose-600 to-slate-900",
  burger: "bg-gradient-to-br from-yellow-600 to-orange-800",
  bakery: "bg-gradient-to-br from-orange-300 to-amber-600",
  bar: "bg-gradient-to-br from-purple-700 to-slate-950",
  luxury: "bg-gradient-to-br from-yellow-500 to-slate-900",
  modern: "bg-gradient-to-br from-sky-500 to-indigo-700",
  minimal: "bg-gradient-to-br from-neutral-200 to-neutral-400",
  elegant: "bg-gradient-to-br from-rose-300 to-neutral-700",
  dark: "bg-gradient-to-br from-neutral-800 to-black",
};

export function TemplateGallery({ menuId, templates }: TemplateGalleryProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!selectedId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await menusApi.applyTemplate(menuId, selectedId);
      router.push(`/menus/${menuId}/editor`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не вдалося застосувати шаблон.");
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
                "border-border duration-fast group flex flex-col overflow-hidden rounded-lg border text-left transition-colors",
                isSelected && "ring-accent-400 ring-2 ring-offset-2",
              )}
            >
              <div
                className={cn(
                  "relative flex h-24 items-center justify-center",
                  SWATCH_CLASSES[template.slug] ?? "bg-neutral-400",
                )}
              >
                {isSelected && (
                  <span className="bg-accent-400 absolute top-2 right-2 flex size-6 items-center justify-center rounded-full text-white">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 p-3">
                <p className="text-body-sm font-medium">{template.name}</p>
                <Badge variant="neutral" className="w-fit">
                  {template.category === "cuisine" ? "Кухня" : "Стиль"}
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
        Застосувати шаблон і перейти до стилю
      </Button>
    </div>
  );
}
