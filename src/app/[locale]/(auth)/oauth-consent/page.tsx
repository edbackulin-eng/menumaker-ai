import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { OAuthConsentForm } from "@/components/auth/oauth-consent-form";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SUPPORTED_PROVIDERS = new Set(["google"]);

function isSupportedProvider(value: string | undefined): value is "google" {
  return value !== undefined && SUPPORTED_PROVIDERS.has(value);
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.oauthConsent");
  return { title: t("metaTitle") };
}

/**
 * Reached only via GoogleSignInButton's link (`/oauth-consent?provider=google`)
 * — never a direct user-typed URL in normal use, but `?provider=` is still an
 * ordinary query string, so an unsupported or missing value is handled with
 * an in-page error state (not a 500/notFound()) per the same "no silent
 * failure" standard as /region-unavailable.
 */
export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  const { provider } = await searchParams;
  const t = await getTranslations("auth.oauthConsent");

  if (!isSupportedProvider(provider)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("invalidRequestTitle")}</CardTitle>
          <CardDescription>{t("invalidRequestMessage")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className="text-accent-600 font-medium hover:underline">
            {t("backHome")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthConsentForm provider={provider} />
      </CardContent>
    </Card>
  );
}
