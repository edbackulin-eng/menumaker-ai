import { getTranslations } from "next-intl/server";

import { isDemoMode } from "@/config/demo";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { SiteFooter } from "@/components/shared/site-footer";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex w-full max-w-sm items-center justify-between gap-4">
          <Link href="/" className="text-h6 text-foreground font-semibold">
            {t("brand")}
          </Link>
          <LocaleSwitcher />
        </div>
        <div className="w-full max-w-sm">
          {isDemoMode ? (
            <div className="border-border bg-surface-secondary rounded-lg border p-6 text-center">
              <p className="text-body-sm text-foreground-secondary">
                Вхід і реєстрація вимкнені в демо-режимі. Це портфоліо-версія MenuMaker AI —
                перегляньте готовий приклад меню без авторизації.
              </p>
              <Link
                href="/"
                className="text-accent-600 text-body-sm mt-3 inline-block font-medium hover:underline"
              >
                ← На головну
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
