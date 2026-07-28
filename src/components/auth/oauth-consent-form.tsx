"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { TermsConsentCheckbox } from "@/components/auth/terms-consent-checkbox";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export interface OAuthConsentFormProps {
  provider: "google";
}

/**
 * The only place in the app that actually calls `signInWithOAuth` — reached
 * exclusively via /oauth-consent, itself reached exclusively by clicking
 * "Continue with Google" on /login or /register (see
 * google-signin-button.tsx). "Continue" stays disabled until the checkbox is
 * ticked, so there is no code path left that reaches Google without it.
 */
export function OAuthConsentForm({ provider }: OAuthConsentFormProps) {
  const t = useTranslations("auth.oauthConsent");
  const [consent, setConsent] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const handleContinue = async () => {
    setIsLoading(true);
    setError(undefined);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (oauthError) {
      setIsLoading(false);
      setError(t("genericError"));
    }
    // On success the browser navigates away to Google; nothing left to do.
  };

  return (
    <div className="flex flex-col gap-4">
      <TermsConsentCheckbox
        checked={consent}
        onCheckedChange={setConsent}
        prefix={t("consentPrefix")}
        privacyLabel={t("consentPrivacyLink")}
        and={t("consentAnd")}
        termsLabel={t("consentTermsLink")}
        suffix={t("consentSuffix")}
      />
      {error && <p className="text-body-sm text-error-600">{error}</p>}
      <Button
        type="button"
        className="w-full"
        disabled={!consent}
        isLoading={isLoading}
        onClick={handleContinue}
      >
        {t("continueButton")}
      </Button>
      <Link
        href="/login"
        className="text-body-sm text-foreground-secondary text-center hover:underline"
      >
        {t("cancelButton")}
      </Link>
    </div>
  );
}
