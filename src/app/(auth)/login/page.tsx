import type { Metadata } from "next";
import Link from "next/link";

import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Вхід — MenuMaker AI" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Увійти</CardTitle>
        <CardDescription>Раді бачити вас знову.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <LoginForm />
        <div className="flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-caption text-foreground-tertiary">або</span>
          <div className="bg-border h-px flex-1" />
        </div>
        <GoogleSignInButton label="Увійти через Google" />
        <p className="text-body-sm text-foreground-secondary text-center">
          Немає акаунту?{" "}
          <Link href="/register" className="text-accent-600 font-medium hover:underline">
            Зареєструватись
          </Link>
        </p>
        <p className="text-body-sm text-center">
          <Link href="/forgot-password" className="text-accent-600 hover:underline">
            Забули пароль?
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
