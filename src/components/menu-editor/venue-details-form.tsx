"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import type { VenueDraft } from "@/components/menu-editor/use-menu-content-autosave";

export interface VenueDetailsFormProps {
  venue: VenueDraft;
  onChange: (field: keyof VenueDraft, value: string) => void;
}

/**
 * The venue-details section of the editor: name, tagline, address, phone —
 * the fields that fill `menus.content.venue`.
 *
 * These only surface in the engines that have a masthead or footer (Modern,
 * Grid, Bistro, Editorial); the classic engine ignores them. The form is
 * shown regardless of the current template, with a one-line note saying so,
 * rather than appearing and disappearing as the user switches templates —
 * silently hiding a field the user just typed into is worse than a short
 * explanation, and the template can still be changed after this step.
 *
 * All four fields are optional. Every keystroke goes straight to the shared
 * content autosave (via `onChange`), which debounces and persists together
 * with the currency — see useMenuContentAutosave.
 */
export function VenueDetailsForm({ venue, onChange }: VenueDetailsFormProps) {
  const t = useTranslations("menuGenerator.editor.venue");

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-body-sm text-foreground font-medium">{t("heading")}</h3>
        <p className="text-caption text-foreground-secondary">{t("note")}</p>
      </div>

      <Input
        label={t("name")}
        value={venue.name}
        onChange={(e) => onChange("name", e.target.value)}
        maxLength={120}
        autoComplete="off"
      />
      <Input
        label={t("tagline")}
        value={venue.tagline}
        onChange={(e) => onChange("tagline", e.target.value)}
        placeholder={t("taglinePlaceholder")}
        maxLength={120}
        autoComplete="off"
      />
      <Input
        label={t("address")}
        value={venue.address}
        onChange={(e) => onChange("address", e.target.value)}
        maxLength={200}
        autoComplete="off"
      />
      <Input
        label={t("phone")}
        value={venue.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        maxLength={40}
        inputMode="tel"
        autoComplete="off"
      />
    </section>
  );
}
