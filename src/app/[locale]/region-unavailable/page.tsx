import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { SiteFooter } from "@/components/shared/site-footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("regionUnavailable");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * Where `src/proxy.ts` sends a visitor from a geo-blocked country (see
 * `src/config/geo-block.ts`) instead of `/login` or `/register`.
 *
 * Deliberately its own plain page, not a banner layered on top of the auth
 * form: rendering the login/register form (Turnstile widget included)
 * right next to "this service isn't available here" reads as broken, not
 * deliberate. No form, no CTA back into the blocked flow — just the
 * explanation, per the PO's "не мовчазна помилка" requirement.
 */
export default async function RegionUnavailablePage() {
  const t = await getTranslations("regionUnavailable");
  const tNav = await getTranslations("nav");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-h6 text-foreground font-semibold">{tNav("brand")}</span>
        <LocaleSwitcher />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-h4 text-foreground font-semibold">{t("title")}</h1>
        <p className="text-body text-foreground-secondary mt-4 max-w-md">{t("message")}</p>
        <Link href="/" className="text-accent-600 mt-6 font-medium hover:underline">
          {t("backHome")}
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}
