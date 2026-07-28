import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SITE_URL, buildLocaleAlternates } from "@/config/seo";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { SiteFooter } from "@/components/shared/site-footer";

/**
 * The landing page's own metadata, layered on top of `[locale]/layout.tsx`'s
 * (which supplies `metadataBase` and a fallback title/description). This is
 * currently the only page under `[locale]` that sets `alternates.languages`
 * — see `buildLocaleAlternates()` for why that isn't hoisted to the shared
 * layout instead.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildLocaleAlternates("/"),
  };
}

export default async function Home() {
  const t = await getTranslations("landing");
  const tAuth = await getTranslations("auth.login");

  return (
    <div className="flex flex-1 flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", name: t("title"), url: SITE_URL.origin },
            { "@type": "WebSite", name: t("title"), url: SITE_URL.origin },
          ],
        }}
      />
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-h6 text-foreground font-semibold">{t("title")}</span>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link href="/login" className="text-body-sm text-foreground-secondary hover:underline">
            {tAuth("title")}
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-black">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </div>
      <SiteFooter />
    </div>
  );
}
