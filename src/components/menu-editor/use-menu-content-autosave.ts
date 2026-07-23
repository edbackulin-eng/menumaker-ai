"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CurrencyId } from "@/config/menu-currency";
import { menusApi } from "@/lib/api-client/menus";
import type { MenuContent, MenuVenue } from "@/services/ai/schemas/menu-content";

const AUTOSAVE_DEBOUNCE_MS = 3000;

export type ContentSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

/** The editable fields of the venue form — every one optional, matching menuVenueSchema. */
export type VenueDraft = {
  name: string;
  tagline: string;
  address: string;
  phone: string;
};

/** Every `menus.content` field the editor can change, held together so they always save together. */
type ContentDraft = {
  currencyId: CurrencyId;
  venue: VenueDraft;
  hidePhotos: boolean;
};

function venueFromContent(venue: MenuVenue | undefined): VenueDraft {
  return {
    name: venue?.name ?? "",
    tagline: venue?.tagline ?? "",
    address: venue?.address ?? "",
    phone: venue?.phone ?? "",
  };
}

/**
 * Collapses a draft to the stored `venue` shape, dropping blank fields and
 * returning `undefined` when nothing is filled — so an untouched form
 * stores no `venue` at all rather than an object of empty strings, and the
 * Modern/Grid/Editorial banners fall back to the menu title as designed.
 */
function venueForStorage(draft: VenueDraft): MenuVenue | undefined {
  const trimmed = {
    ...(draft.name.trim() ? { name: draft.name.trim() } : {}),
    ...(draft.tagline.trim() ? { tagline: draft.tagline.trim() } : {}),
    ...(draft.address.trim() ? { address: draft.address.trim() } : {}),
    ...(draft.phone.trim() ? { phone: draft.phone.trim() } : {}),
  };
  return Object.keys(trimmed).length > 0 ? trimmed : undefined;
}

/**
 * One debounced save path for every field that lives in `menus.content`
 * rather than `style_overrides` — the currency, the venue details, and the
 * "no photos" choice.
 *
 * They MUST save together: the menu PATCH replaces `content` wholesale, so
 * independent savers each sending `{ ...content, <their field> }` would
 * clobber each other's change (each starts from the same base `content`
 * prop, unaware of the others' latest values). One `draft` object holding
 * all three, sent in a single PATCH, is what prevents that — and is why a
 * fourth content field must be added here rather than given its own timer.
 *
 * The style_overrides autosave (colors/fonts/order) stays separate: it
 * targets a different endpoint and a different column, so it has no such
 * conflict with this one.
 */
export function useMenuContentAutosave({
  menuId,
  content,
  initialCurrencyId,
}: {
  menuId: string;
  content: MenuContent;
  initialCurrencyId: CurrencyId;
}) {
  const [draft, setDraft] = useState<ContentDraft>(() => ({
    currencyId: initialCurrencyId,
    venue: venueFromContent(content.venue),
    hidePhotos: content.hidePhotos ?? false,
  }));
  const [saveStatus, setSaveStatus] = useState<ContentSaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(
    async (next: ContentDraft) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setSaveStatus("saving");
      try {
        await menusApi.update(menuId, {
          content: {
            ...content,
            currency: next.currencyId,
            venue: venueForStorage(next.venue),
            hidePhotos: next.hidePhotos,
          },
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [menuId, content],
  );

  /**
   * Applies a change and schedules the debounced save from the *resulting*
   * draft — computed inside the state updater so it is always the latest
   * value, never a stale closure over a sibling field.
   */
  const change = useCallback(
    (patch: Partial<ContentDraft>) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        setSaveStatus("pending");
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => void flush(next), AUTOSAVE_DEBOUNCE_MS);
        return next;
      });
    },
    [flush],
  );

  const changeCurrency = useCallback((id: CurrencyId) => change({ currencyId: id }), [change]);

  const changeVenueField = useCallback(
    (field: keyof VenueDraft, value: string) =>
      setDraft((prev) => {
        const next = { ...prev, venue: { ...prev.venue, [field]: value } };
        setSaveStatus("pending");
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => void flush(next), AUTOSAVE_DEBOUNCE_MS);
        return next;
      }),
    [flush],
  );

  const changeHidePhotos = useCallback((value: boolean) => change({ hidePhotos: value }), [change]);

  /** Force an immediate save of the current values — for the Save/Continue buttons. */
  const flushNow = useCallback(() => flush(draft), [flush, draft]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const isDirty = saveStatus === "pending" || saveStatus === "saving" || saveStatus === "error";

  return {
    currencyId: draft.currencyId,
    venue: draft.venue,
    hidePhotos: draft.hidePhotos,
    saveStatus,
    isDirty,
    changeCurrency,
    changeVenueField,
    changeHidePhotos,
    flushNow,
  };
}
