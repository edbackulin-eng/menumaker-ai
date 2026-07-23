"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CURATED_CURRENCIES, type CurrencyId } from "@/config/menu-currency";
import { menusApi } from "@/lib/api-client/menus";
import { categoryAwareKeyboardCoordinates } from "@/lib/dnd/category-aware-keyboard-coordinates";
import { applyStyleOrder } from "@/lib/utils/menu-content-order";
import { resolveEffectiveStyle, type ResolvedMenuStyle } from "@/lib/utils/resolve-menu-style";
import type { StyleOverridesInput } from "@/lib/validations/menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EditorControlsPanel } from "@/components/menu-editor/editor-controls-panel";
import { MenuLivePreview } from "@/components/menu-editor/menu-live-preview";
import { RefreshPhotosSection } from "@/components/menu-editor/refresh-photos-section";
import { VenueDetailsForm } from "@/components/menu-editor/venue-details-form";
import { useMenuContentAutosave } from "@/components/menu-editor/use-menu-content-autosave";
import { useReportWizardDirty } from "@/components/menu-generator/wizard-exit";

const AUTOSAVE_DEBOUNCE_MS = 3000;

export interface MenuStyleEditorProps {
  menuId: string;
  content: MenuContent;
  initialStyleOverrides: StyleOverridesInput;
  templateDefaults: ResolvedMenuStyle;
  initialCurrencyId: CurrencyId;
}

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

function combineSaveStatus(a: SaveStatus, b: SaveStatus): SaveStatus {
  if (a === "error" || b === "error") return "error";
  if (a === "saving" || b === "saving") return "saving";
  if (a === "pending" || b === "pending") return "pending";
  if (a === "saved" || b === "saved") return "saved";
  return "idle";
}

export function MenuStyleEditor({
  menuId,
  content,
  initialStyleOverrides,
  templateDefaults,
  initialCurrencyId,
}: MenuStyleEditorProps) {
  const t = useTranslations("menuGenerator.editor");
  const router = useRouter();
  const [styleOverrides, setStyleOverrides] = useState<StyleOverridesInput>(initialStyleOverrides);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isContinuing, setIsContinuing] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Currency + venue both live in `menus.content` and share one debounced
  // save (see the hook's doc comment: a wholesale content PATCH means they
  // must save together or clobber each other). style_overrides stays on its
  // own save path below.
  const contentAutosave = useMenuContentAutosave({ menuId, content, initialCurrencyId });
  const { currencyId } = contentAutosave;

  // A style change autosaves after a debounce; between the change and the
  // flush there's an unpersisted edit. "pending" (debounce running),
  // "saving" (request in flight) and "error" (last save failed) are the
  // states where exiting would drop something. "idle"/"saved" are clean.
  // The content autosave (currency/venue) has the same dirty-exit reasoning.
  useReportWizardDirty(
    saveStatus === "pending" ||
      saveStatus === "saving" ||
      saveStatus === "error" ||
      contentAutosave.isDirty,
  );

  const effectiveStyle = useMemo(
    () => resolveEffectiveStyle(templateDefaults, styleOverrides),
    [templateDefaults, styleOverrides],
  );

  // Currency and venue are overlaid from the content-autosave state so
  // editing either updates the live preview immediately (the venue banner,
  // the prices) — `content` itself isn't mutated, only what's saved.
  const venueOverlay = useMemo(() => {
    const v = contentAutosave.venue;
    const trimmed = {
      ...(v.name.trim() ? { name: v.name.trim() } : {}),
      ...(v.tagline.trim() ? { tagline: v.tagline.trim() } : {}),
      ...(v.address.trim() ? { address: v.address.trim() } : {}),
      ...(v.phone.trim() ? { phone: v.phone.trim() } : {}),
    };
    return Object.keys(trimmed).length > 0 ? trimmed : undefined;
  }, [contentAutosave.venue]);

  // Only recomputed when order/currency/venue actually change, not on every
  // color/font tweak — deliberately depends on the order fields only, not
  // the whole styleOverrides object.
  const orderedContent = useMemo(() => {
    const ordered = applyStyleOrder(content, styleOverrides);
    const currencySymbol = CURATED_CURRENCIES.find((c) => c.id === currencyId)?.symbol;
    return { ...ordered, currency: currencySymbol ?? currencyId, venue: venueOverlay };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, styleOverrides.categoryOrder, styleOverrides.itemOrder, currencyId, venueOverlay]);

  // Takes the style to save as a parameter rather than reading current
  // state via a ref — mutating a ref during render is a React error, and
  // both callers below already have the up-to-date value in scope anyway
  // (either from setState's updater or from render itself).
  const flushSave = useCallback(
    async (style: StyleOverridesInput) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      setSaveStatus("saving");
      try {
        await menusApi.updateStyle(menuId, style);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [menuId],
  );

  const updateStyle = useCallback(
    (patch: Partial<StyleOverridesInput>) => {
      setStyleOverrides((prev) => {
        const next = { ...prev, ...patch };
        setSaveStatus("pending");
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => void flushSave(next), AUTOSAVE_DEBOUNCE_MS);
        return next;
      });
    },
    [flushSave],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: categoryAwareKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type as "category" | "item" | undefined;

    if (activeType === "category") {
      // Dragging a category card downward inevitably passes over its own
      // (or a neighboring category's) item rows first — closestCenter can
      // resolve `over` to one of those nested items rather than the sibling
      // category. Since every item knows its parent category id, that case
      // is resolved back up to "drop near this item's category" instead of
      // silently no-op'ing (which is what happens if `over.id` is required
      // to literally be a category id).
      const overCategoryId =
        over.data.current?.type === "item"
          ? (over.data.current.categoryId as string)
          : (over.id as string);

      const oldIndex = orderedContent.categories.findIndex((c) => c.id === active.id);
      const newIndex = orderedContent.categories.findIndex((c) => c.id === overCategoryId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const categoryOrder = arrayMove(orderedContent.categories, oldIndex, newIndex).map(
        (c) => c.id,
      );
      updateStyle({ categoryOrder });
      return;
    }

    if (activeType === "item") {
      const categoryId = active.data.current?.categoryId as string | undefined;
      const category = orderedContent.categories.find((c) => c.id === categoryId);
      if (!category) return;
      const oldIndex = category.items.findIndex((i) => i.id === active.id);
      const newIndex = category.items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newItemIds = arrayMove(category.items, oldIndex, newIndex).map((i) => i.id);
      updateStyle({ itemOrder: { ...styleOverrides.itemOrder, [category.id]: newItemIds } });
    }
  }

  async function handleContinue() {
    setIsContinuing(true);
    await Promise.all([flushSave(styleOverrides), contentAutosave.flushNow()]);
    router.push(`/menus/${menuId}/result`);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6 pb-20 lg:flex-row lg:pb-0">
        <div className="min-w-0 flex-1">
          <MenuLivePreview orderedContent={orderedContent} style={effectiveStyle} />
        </div>
        <div className="border-border bg-surface fixed inset-x-0 bottom-0 z-10 flex max-h-[45vh] flex-col gap-6 overflow-y-auto rounded-t-lg border-t p-4 shadow-lg lg:static lg:max-h-none lg:w-72 lg:shrink-0 lg:overflow-visible lg:rounded-lg lg:border lg:p-4 lg:shadow-sm">
          <EditorControlsPanel
            accentColorId={effectiveStyle.accentColorId}
            fontId={effectiveStyle.fontId}
            columns={effectiveStyle.columns}
            currencyId={currencyId}
            onAccentColorChange={(accentColorId) => updateStyle({ accentColorId })}
            onFontChange={(fontId) => updateStyle({ fontId })}
            onColumnsChange={(columns) => updateStyle({ columns })}
            onCurrencyChange={contentAutosave.changeCurrency}
          />
          <VenueDetailsForm
            venue={contentAutosave.venue}
            onChange={contentAutosave.changeVenueField}
          />
          <RefreshPhotosSection menuId={menuId} content={content} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <SaveStatusLabel status={combineSaveStatus(saveStatus, contentAutosave.saveStatus)} />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void flushSave(styleOverrides);
              void contentAutosave.flushNow();
            }}
          >
            {t("save")}
          </Button>
          <Button type="button" onClick={() => void handleContinue()} isLoading={isContinuing}>
            {t("continue")}
          </Button>
        </div>
      </div>
    </DndContext>
  );
}

function SaveStatusLabel({ status }: { status: SaveStatus }) {
  const t = useTranslations("menuGenerator.editor.saveStatus");
  if (status === "idle") return <span />;
  return (
    <p
      className={
        status === "error"
          ? "text-body-sm text-error-600"
          : "text-body-sm text-foreground-secondary"
      }
    >
      {t(status)}
    </p>
  );
}
