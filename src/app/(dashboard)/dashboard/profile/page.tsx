import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { DeleteAccountSection } from "@/components/dashboard/delete-account-section";
import { ProfileDetailsForm } from "@/components/dashboard/profile-details-form";

export const metadata: Metadata = { title: "Профіль — MenuMaker AI" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <Container size="md" className="py-10">
      <PageHeader title="Профіль" description="Керуйте своїм акаунтом." />

      <div className="mt-6 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Фото профілю</CardTitle>
          </CardHeader>
          <CardContent>
            <AvatarUpload initialAvatarUrl={user.avatar_url} name={user.full_name ?? user.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Особисті дані</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileDetailsForm initialFullName={user.full_name} initialLocale={user.locale} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Пароль</CardTitle>
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
