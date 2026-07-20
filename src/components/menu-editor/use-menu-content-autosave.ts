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
 * rather than `style_overrides` — currently the currency and the venue
 * details.
 *
 * They MUST share one save: the menu PATCH replaces `content` wholesale, so
 * two independent savers each sending `{ ...content, <their field> }` would
 * clobber each other's change (each starts from the same base `content`
 * prop, unaware of the other's latest value). Holding both here and sending
 * them together in a single `{ ...content, currency, venue }` is what keeps
 * a currency change and a venue edit from overwriting one another.
 *
 * The style_overrides autosave (colors/fonts/order) stays separate — it
 * targets a different endpoint (menusApi.updateStyle) and a different
 * column, so it has no such conflict with this one.
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
  const [currencyId, setCurrencyId] = useState<CurrencyId>(initialCurrencyId);
  const [venue, setVenue] = useState<VenueDraft>(() => venueFromContent(content.venue));
  const [saveStatus, setSaveStatus] = useState<ContentSaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(
    async (nextCurrency: CurrencyId, nextVenue: VenueDraft) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setSaveStatus("saving");
      try {
        await menusApi.update(menuId, {
          content: {
            ...content,
            currency: nextCurrency,
            venue: venueForStorage(nextVenue),
          },
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [menuId, content],
  );

  const schedule = useCallback(
    (nextCurrency: CurrencyId, nextVenue: VenueDraft) => {
      setSaveStatus("pending");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(
        () => void flush(nextCurrency, nextVenue),
        AUTOSAVE_DEBOUNCE_MS,
      );
    },
    [flush],
  );

  const changeCurrency = useCallback(
    (id: CurrencyId) => {
      setCurrencyId(id);
      setVenue((currentVenue) => {
        schedule(id, currentVenue);
        return currentVenue;
      });
    },
    [schedule],
  );

  const changeVenueField = useCallback(
    (field: keyof VenueDraft, value: string) => {
      setVenue((prev) => {
        const next = { ...prev, [field]: value };
        setCurrencyId((currentCurrency) => {
          schedule(currentCurrency, next);
          return currentCurrency;
        });
        return next;
      });
    },
    [schedule],
  );

  /** Force an immediate save of the current values — for the Save/Continue buttons. */
  const flushNow = useCallback(() => flush(currencyId, venue), [flush, currencyId, venue]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const isDirty = saveStatus === "pending" || saveStatus === "saving" || saveStatus === "error";

  return {
    currencyId,
    venue,
    saveStatus,
    isDirty,
    changeCurrency,
    changeVenueField,
    flushNow,
  };
}
