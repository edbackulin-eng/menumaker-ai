"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordRequestAction } from "@/features/auth/actions";
import { type ForgotPasswordInput, forgotPasswordSchema } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
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
    return (
      <p className="text-body-sm text-foreground-secondary">
        Якщо акаунт з такою адресою існує, ми надіслали на неї лист з посиланням для скидання
        пароля. Перевірте пошту (і теку «Спам»).
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Надіслати посилання
      </Button>
    </form>
  );
}
