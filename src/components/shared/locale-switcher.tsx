"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { CURATED_LOCALES, isLocaleId } from "@/config/profile";
import { profileApi } from "@/lib/api-client/profile";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/select";

const LOCALE_OPTIONS = CURATED_LOCALES.map((locale) => ({ value: locale.id, label: locale.label }));

export interface LocaleSwitcherProps {
  /** Persist the choice to `profiles.locale` too (signed-in users) — for anonymous visitors the locale cookie next-intl's router sets is the only persistence. */
  persistToProfile?: boolean;
  className?: string;
}

/**
 * Switching locale here always navigates through next-intl's own `router`,
 * never a raw redirect — that's what makes this an *explicit* choice in
 * proxy.ts's priority order (it sets the `NEXT_LOCALE` cookie), outranking
 * both Accept-Language auto-detection and the Ukraine geo-priority rule on
 * every later visit. Persisting to `profiles.locale` (when signed in) makes
 * that same explicit choice follow the user to a new browser/device too.
 */
export function LocaleSwitcher({ persistToProfile = false, className }: LocaleSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("localeSwitcher");
  const [isPending, startTransition] = useTransition();
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);

  function handleChange(nextLocale: string) {
    if (!isLocaleId(nextLocale) || nextLocale === locale) return;
    setPendingLocale(nextLocale);
    if (persistToProfile) {
      void profileApi.update({ locale: nextLocale }).catch(() => {
        // Best-effort: the interface still switches for this browser via
        // the cookie below even if the profile write fails (e.g. offline).
      });
    }
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Select
      label={t("label")}
      options={LOCALE_OPTIONS}
      value={pendingLocale ?? locale}
      onValueChange={handleChange}
      disabled={isPending}
      containerClassName={className}
    />
  );
}
