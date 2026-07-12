"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi } from "@/lib/api-client/menus";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";

export interface MenuReviewEditorProps {
  menuId: string;
  initialContent: MenuContent;
}

function emptyItem() {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: undefined,
    price: undefined,
  } as MenuContent["categories"][number]["items"][number];
}

export function MenuReviewEditor({ menuId, initialContent }: MenuReviewEditorProps) {
  const t = useTranslations("menuGenerator.review");
  const router = useRouter();
  const [content, setContent] = useState<MenuContent>(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateCategory(index: number, patch: Partial<MenuContent["categories"][number]>) {
    setContent((prev) => ({
      ...prev,
      categories: prev.categories.map((category, i) =>
        i === index ? { ...category, ...patch } : category,
      ),
    }));
  }

  function removeCategory(index: number) {
    setContent((prev) => ({ ...prev, categories: prev.categories.filter((_, i) => i !== index) }));
  }

  function addCategory() {
    setContent((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id: crypto.randomUUID(), name: t("newCategoryName"), items: [] },
      ],
    }));
  }

  function updateItem(
    categoryIndex: number,
    itemIndex: number,
    patch: Partial<MenuContent["categories"][number]["items"][number]>,
  ) {
    setContent((prev) => ({
      ...prev,
      categories: prev.categories.map((category, ci) =>
        ci !== categoryIndex
          ? category
          : {
              ...category,
              items: category.items.map((item, ii) =>
                ii === itemIndex ? { ...item, ...patch } : item,
              ),
            },
      ),
    }));
  }

  function removeItem(categoryIndex: number, itemIndex: number) {
    setContent((prev) => ({
      ...prev,
      categories: prev.categories.map((category, ci) =>
        ci !== categoryIndex
          ? category
          : { ...category, items: category.items.filter((_, ii) => ii !== itemIndex) },
      ),
    }));
  }

  function addItem(categoryIndex: number) {
    setContent((prev) => ({
      ...prev,
      categories: prev.categories.map((category, ci) =>
        ci !== categoryIndex ? category : { ...category, items: [...category.items, emptyItem()] },
      ),
    }));
  }

  const totalItems = content.categories.reduce((sum, category) => sum + category.items.length, 0);

  async function handleConfirm() {
    setError(null);

    // Empty/blank names would otherwise fail the server-side zod validation
    // with a less actionable error — filter them out client-side first.
    const cleaned: MenuContent = {
      ...content,
      categories: content.categories
        .map((category) => ({
          ...category,
          items: category.items.filter((item) => item.name.trim()),
        }))
        .filter((category) => category.name.trim()),
    };

    if (cleaned.categories.length === 0 || cleaned.categories.every((c) => c.items.length === 0)) {
      setError(t("atLeastOneItemError"));
      return;
    }

    setIsSubmitting(true);
    try {
      await menusApi.confirm(menuId, cleaned);
      router.push(`/menus/${menuId}/template`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t("confirmGenericError"));
      setIsSubmitting(false);
    }
  }

  if (content.categories.length === 0) {
    return (
      <EmptyState
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          <Button variant="secondary" onClick={addCategory}>
            <Plus className="size-4" aria-hidden="true" /> {t("addFirstCategory")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {content.categories.map((category, categoryIndex) => (
        <Card key={category.id}>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <Input
              value={category.name}
              onChange={(event) => updateCategory(categoryIndex, { name: event.target.value })}
              placeholder={t("categoryNamePlaceholder")}
              aria-label={t("categoryNameAria")}
              containerClassName="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeCategory(categoryIndex)}
              aria-label={t("removeCategoryAria")}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {category.items.map((item, itemIndex) => (
              <div
                key={item.id}
                className="border-border grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_auto_auto]"
              >
                <Input
                  value={item.name}
                  onChange={(event) =>
                    updateItem(categoryIndex, itemIndex, { name: event.target.value })
                  }
                  placeholder={t("itemNamePlaceholder")}
                  aria-label={t("itemNameAria")}
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  value={item.price ?? ""}
                  onChange={(event) =>
                    updateItem(categoryIndex, itemIndex, {
                      price: event.target.value === "" ? undefined : Number(event.target.value),
                    })
                  }
                  placeholder={t("pricePlaceholder")}
                  aria-label={t("priceAria")}
                  className="sm:w-28"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(categoryIndex, itemIndex)}
                  aria-label={t("removeItemAria")}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
                <Textarea
                  value={item.description ?? ""}
                  onChange={(event) =>
                    updateItem(categoryIndex, itemIndex, {
                      description: event.target.value || undefined,
                    })
                  }
                  placeholder={t("descriptionPlaceholder")}
                  aria-label={t("descriptionAria")}
                  rows={2}
                  className="sm:col-span-3"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addItem(categoryIndex)}
              className="self-start"
            >
              <Plus className="size-4" aria-hidden="true" /> {t("addItem")}
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="secondary" onClick={addCategory} className="self-start">
        <Plus className="size-4" aria-hidden="true" /> {t("addCategory")}
      </Button>

      {error && (
        <div className="border-error-400/30 bg-error-50 text-body-sm text-error-600 rounded-md border px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-body-sm text-foreground-secondary">
          {t("recognizedCount", { count: totalItems })}
        </p>
        <Button type="button" onClick={handleConfirm} isLoading={isSubmitting}>
          {t("confirm")}
        </Button>
      </div>
    </div>
  );
}
