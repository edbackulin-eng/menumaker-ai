"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";

import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicEnv } from "@/config/env";
import { signUpAction } from "@/features/auth/actions";
import { type RegisterInput, registerSchema } from "@/lib/validations/auth";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const turnstileRef = React.useRef<TurnstileWidgetHandle>(null);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { turnstileToken: "" },
  });

  const onSubmit = async (data: RegisterInput) => {
    const result = await signUpAction(data);
    if (!result.success) {
      setError("root", { message: result.error });
      setValue("turnstileToken", "");
      turnstileRef.current?.reset();
    }
  };

  // react-hooks/refs false positive: it flags this call solely because
  // `turnstileRef` exists somewhere in the component, not because
  // react-hook-form's `handleSubmit` actually reads it — this is the
  // standard, safe RHF submit pattern.
  // eslint-disable-next-line react-hooks/refs
  const onFormSubmit = handleSubmit(onSubmit);

  return (
    <form onSubmit={onFormSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label={t("emailLabel")}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label={t("passwordLabel")}
        type="password"
        autoComplete="new-password"
        helperText={t("passwordHelper")}
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label={t("confirmPasswordLabel")}
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <div className="flex flex-col gap-1.5">
        <TurnstileWidget
          ref={turnstileRef}
          siteKey={publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onVerify={(token) => setValue("turnstileToken", token, { shouldValidate: true })}
          onExpire={() => setValue("turnstileToken", "")}
        />
        {errors.turnstileToken && (
          <p className="text-body-sm text-error-600">{errors.turnstileToken.message}</p>
        )}
      </div>
      {errors.root && <p className="text-body-sm text-error-600">{errors.root.message}</p>}
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {t("submit")}
      </Button>
    </form>
  );
}
