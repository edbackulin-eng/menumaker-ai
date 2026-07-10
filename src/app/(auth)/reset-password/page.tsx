import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const metadata: Metadata = { title: "Новий пароль — MenuMaker AI" };

export default async function ResetPasswordPage() {
  // Reachable only after /auth/callback exchanges a recovery-link code for a
  // session — if there's no session, the link was already used or expired.
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Посилання недійсне</CardTitle>
          <CardDescription>
            Це посилання для скидання пароля вже використане або застаріло.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/forgot-password"
            className="text-body-sm text-accent-600 font-medium hover:underline"
          >
            Запросити нове посилання
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новий пароль</CardTitle>
        <CardDescription>Встановіть новий пароль для свого акаунту.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
