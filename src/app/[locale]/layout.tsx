import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { RootShell } from "@/app/root-shell";
import { SITE_URL } from "@/config/seo";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    // Inherited by every page under this segment for resolving relative
    // URLs in `alternates`/`openGraph` — set once here rather than on each
    // leaf page. Only `/[locale]/page.tsx` (the landing page, the one page
    // under this tree with real per-locale URL variants) currently adds
    // its own `alternates.languages` on top of this.
    metadataBase: SITE_URL,
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Must run before any next-intl API is used in this layout/its children
  // (enables static rendering for this locale — otherwise the route falls
  // back to fully dynamic rendering).
  setRequestLocale(locale);

  return (
    <RootShell lang={locale}>
      <NextIntlClientProvider>{children}</NextIntlClientProvider>
    </RootShell>
  );
}
