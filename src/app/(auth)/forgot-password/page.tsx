import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Відновлення пароля — MenuMaker AI" };

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Забули пароль?</CardTitle>
        <CardDescription>Введіть email — надішлемо посилання для скидання пароля.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ForgotPasswordForm />
        <p className="text-body-sm text-foreground-secondary text-center">
          Згадали пароль?{" "}
          <Link href="/login" className="text-accent-600 font-medium hover:underline">
            Увійти
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
