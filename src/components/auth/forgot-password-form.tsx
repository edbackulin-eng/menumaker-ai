"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordRequestAction } from "@/features/auth/actions";
import { type ForgotPasswordInput, forgotPasswordSchema } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await resetPasswordRequestAction(data);
    setSubmitted(true);
  };

  if (submitted) {
    return <p className="text-body-sm text-foreground-secondary">{t("submitted")}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label={t("emailLabel")}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {t("submit")}
      </Button>
    </form>
  );
}
