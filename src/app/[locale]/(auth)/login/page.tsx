import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("metaTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  const tCommon = await getTranslations("common");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <LoginForm />
        <div className="flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-caption text-foreground-tertiary">{tCommon("or")}</span>
          <div className="bg-border h-px flex-1" />
        </div>
        <GoogleSignInButton label={t("googleCta")} />
        <p className="text-body-sm text-foreground-secondary text-center">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-accent-600 font-medium hover:underline">
            {t("registerLink")}
          </Link>
        </p>
        <p className="text-body-sm text-center">
          <Link href="/forgot-password" className="text-accent-600 hover:underline">
            {t("forgotPasswordLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
