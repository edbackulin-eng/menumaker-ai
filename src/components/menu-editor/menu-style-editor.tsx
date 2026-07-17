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
import { useReportWizardDirty } from "@/components/menu-generator/wizard-exit";

const AUTOSAVE_DEBOUNCE_MS = 3000;

export interface MenuStyleEditorProps {
  menuId: string;
  content: MenuContent;
  initialStyleOverrides: StyleOverridesInput;
  templateDefaults: ResolvedMenuStyle;
}

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export function MenuStyleEditor({
  menuId,
  content,
  initialStyleOverrides,
  templateDefaults,
}: MenuStyleEditorProps) {
  const t = useTranslations("menuGenerator.editor");
  const router = useRouter();
  const [styleOverrides, setStyleOverrides] = useState<StyleOverridesInput>(initialStyleOverrides);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isContinuing, setIsContinuing] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A style change autosaves after a debounce; between the change and the
  // flush there's an unpersisted edit. "pending" (debounce running),
  // "saving" (request in flight) and "error" (last save failed) are the
  // states where exiting would drop something. "idle"/"saved" are clean.
  useReportWizardDirty(
    saveStatus === "pending" || saveStatus === "saving" || saveStatus === "error",
  );

  const effectiveStyle = useMemo(
    () => resolveEffectiveStyle(templateDefaults, styleOverrides),
    [templateDefaults, styleOverrides],
  );

  // Only recomputed when order actually changes, not on every color/font
  // tweak — deliberately depends on the two order fields only, not the
  // whole styleOverrides object.
  const orderedContent = useMemo(
    () => applyStyleOrder(content, styleOverrides),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content, styleOverrides.categoryOrder, styleOverrides.itemOrder],
  );

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
    await flushSave(styleOverrides);
    router.push(`/menus/${menuId}/result`);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6 pb-20 lg:flex-row lg:pb-0">
        <div className="min-w-0 flex-1">
          <MenuLivePreview orderedContent={orderedContent} style={effectiveStyle} />
        </div>
        <EditorControlsPanel
          accentColorId={effectiveStyle.accentColorId}
          fontId={effectiveStyle.fontId}
          columns={effectiveStyle.columns}
          onAccentColorChange={(accentColorId) => updateStyle({ accentColorId })}
          onFontChange={(fontId) => updateStyle({ fontId })}
          onColumnsChange={(columns) => updateStyle({ columns })}
          className="border-border bg-surface fixed inset-x-0 bottom-0 z-10 max-h-[45vh] overflow-y-auto rounded-t-lg border-t p-4 shadow-lg lg:static lg:max-h-none lg:w-72 lg:shrink-0 lg:overflow-visible lg:rounded-lg lg:border lg:p-4 lg:shadow-sm"
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <SaveStatusLabel status={saveStatus} />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => void flushSave(styleOverrides)}>
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
