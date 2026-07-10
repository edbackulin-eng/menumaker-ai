import type { Metadata } from "next";
import Link from "next/link";

import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Реєстрація — MenuMaker AI" };

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Створити акаунт</CardTitle>
        <CardDescription>Перші 3 меню — безкоштовно.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <RegisterForm />
        <div className="flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-caption text-foreground-tertiary">або</span>
          <div className="bg-border h-px flex-1" />
        </div>
        <GoogleSignInButton label="Зареєструватись через Google" />
        <p className="text-body-sm text-foreground-secondary text-center">
          Вже маєте акаунт?{" "}
          <Link href="/login" className="text-accent-600 font-medium hover:underline">
            Увійти
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
