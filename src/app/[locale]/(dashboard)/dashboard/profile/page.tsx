import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { DeleteAccountSection } from "@/components/dashboard/delete-account-section";
import { ProfileDetailsForm } from "@/components/dashboard/profile-details-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.profile");
  return { title: t("metaTitle") };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.profile");

  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  return (
    <Container size="md" className="py-10">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="mt-6 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("avatarCardTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AvatarUpload initialAvatarUrl={user.avatar_url} name={user.full_name ?? user.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("detailsCardTitle")}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ProfileDetailsForm initialFullName={user.full_name} />
            <LocaleSwitcher persistToProfile className="max-w-xs" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("passwordCardTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <DeleteAccountSection email={user.email} />
      </div>
    </Container>
  );
}
