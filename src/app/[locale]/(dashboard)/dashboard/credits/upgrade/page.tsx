import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { Link, redirect } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.creditsUpgrade");
  return { title: t("metaTitle") };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CreditsUpgradePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.creditsUpgrade");

  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  return (
    <Container size="md" className="py-10">
      <PageHeader title={t("title")} />
      <EmptyState
        className="mt-6"
        icon={Sparkles}
        title={t("comingSoonTitle")}
        description={t("comingSoonDescription")}
        action={
          <Link href="/dashboard/credits" className={buttonVariants({ variant: "secondary" })}>
            {t("backToCredits")}
          </Link>
        }
      />
    </Container>
  );
}
