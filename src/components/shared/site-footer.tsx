import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
      <p className="text-body-sm text-foreground-tertiary">
        {t("rights", { year: new Date().getFullYear() })}
      </p>
      <nav className="flex items-center gap-4">
        <Link href="/privacy" className="text-body-sm text-foreground-secondary hover:underline">
          {t("privacy")}
        </Link>
        <Link href="/terms" className="text-body-sm text-foreground-secondary hover:underline">
          {t("terms")}
        </Link>
      </nav>
    </footer>
  );
}
