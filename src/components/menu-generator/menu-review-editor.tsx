"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi } from "@/lib/api-client/menus";
import { ALLOWED_PHOTO_MIME_TYPES } from "@/config/photos";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import type { PhotoSearchResult } from "@/services/photos/types";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { useReportWizardDirty } from "@/components/menu-generator/wizard-exit";
import { DishPhotoImage } from "@/components/menu-render/dish-photo-image";
import { PhotoPickerDialog } from "@/components/menu-generator/photo-picker-dialog";

export interface MenuReviewEditorProps {
  menuId: string;
  initialContent: MenuContent;
}

interface PickerTarget {
  categoryIndex: number;
  itemIndex: number;
  itemId: string;
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
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSelecting, setPickerSelecting] = useState(false);
  const [pickerCandidates, setPickerCandidates] = useState<PhotoSearchResult[]>([]);

  // The recognized content is already persisted (from import); these are
  // refinements that only reach the DB on "confirm". Anything typed here and
  // not confirmed is lost on exit — but a pristine, untouched review isn't
  // (JSON compare against the initial content is exact here: same object
  // shape, no key reordering). While submitting, confirm is the exit.
  useReportWizardDirty(!isSubmitting && JSON.stringify(content) !== JSON.stringify(initialContent));

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

  async function handleOpenPicker(categoryIndex: number, itemIndex: number, itemId: string) {
    setPhotoError((prev) => ({ ...prev, [itemId]: "" }));
    setPickerTarget({ categoryIndex, itemIndex, itemId });
    setPickerCandidates([]);
    setPickerOpen(true);
    setPickerLoading(true);
    try {
      const { candidates } = await menusApi.searchItemPhotoCandidates(menuId, itemId);
      setPickerCandidates(candidates);
    } catch (err) {
      setPhotoError((prev) => ({
        ...prev,
        [itemId]: err instanceof ApiClientError ? err.message : t("photoSearchError"),
      }));
      setPickerOpen(false);
    } finally {
      setPickerLoading(false);
    }
  }

  async function handleSelectPhoto(candidate: PhotoSearchResult) {
    if (!pickerTarget) return;
    const { categoryIndex, itemIndex, itemId } = pickerTarget;
    setPickerSelecting(true);
    try {
      await menusApi.selectItemPhoto(menuId, itemId, candidate.photoUrl);
      updateItem(categoryIndex, itemIndex, { photoUrl: candidate.photoUrl });
      setPickerOpen(false);
    } catch (err) {
      setPhotoError((prev) => ({
        ...prev,
        [itemId]: err instanceof ApiClientError ? err.message : t("photoSelectError"),
      }));
    } finally {
      setPickerSelecting(false);
    }
  }

  async function handleUploadPhoto(
    categoryIndex: number,
    itemIndex: number,
    itemId: string,
    file: File,
  ) {
    setPhotoError((prev) => ({ ...prev, [itemId]: "" }));
    setUploadingItemId(itemId);
    try {
      const { photoUrl } = await menusApi.uploadItemPhoto(menuId, itemId, file);
      updateItem(categoryIndex, itemIndex, { photoUrl });
    } catch (err) {
      setPhotoError((prev) => ({
        ...prev,
        [itemId]: err instanceof ApiClientError ? err.message : t("photoUploadError"),
      }));
    } finally {
      setUploadingItemId(null);
    }
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
                <div className="flex items-center gap-3 sm:col-span-3">
                  <DishPhotoImage
                    src={item.photoUrl}
                    alt={t("photoAlt")}
                    categoryName={category.name}
                    className="size-14 shrink-0 rounded-md"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenPicker(categoryIndex, itemIndex, item.id)}
                        isLoading={pickerLoading && pickerTarget?.itemId === item.id}
                        disabled={uploadingItemId === item.id}
                        data-testid="search-photo-button"
                      >
                        {t("searchPhoto")}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRefs.current[item.id]?.click()}
                        isLoading={uploadingItemId === item.id}
                        disabled={
                          (pickerLoading && pickerTarget?.itemId === item.id) ||
                          uploadingItemId === item.id
                        }
                        data-testid="upload-photo-button"
                      >
                        {t("uploadPhoto")}
                      </Button>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[item.id] = el;
                        }}
                        type="file"
                        accept={ALLOWED_PHOTO_MIME_TYPES.join(",")}
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) {
                            void handleUploadPhoto(categoryIndex, itemIndex, item.id, file);
                          }
                        }}
                      />
                    </div>
                    {photoError[item.id] && (
                      <p className="text-caption text-error-600" data-testid="photo-error">
                        {photoError[item.id]}
                      </p>
                    )}
                  </div>
                </div>
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

      <PhotoPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        candidates={pickerCandidates}
        loading={pickerLoading}
        selecting={pickerSelecting}
        selectedPhotoUrl={
          pickerTarget
            ? content.categories[pickerTarget.categoryIndex]?.items[pickerTarget.itemIndex]
                ?.photoUrl
            : undefined
        }
        onSelect={handleSelectPhoto}
      />
    </div>
  );
}
