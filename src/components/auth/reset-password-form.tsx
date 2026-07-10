"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePasswordAction } from "@/features/auth/actions";
import { type ResetPasswordInput, resetPasswordSchema } from "@/lib/validations/auth";

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordInput) => {
    const result = await updatePasswordAction(data);
    if (!result.success) {
      setError("root", { message: result.error });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Новий пароль"
        type="password"
        autoComplete="new-password"
        helperText="Щонайменше 8 символів."
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Підтвердіть пароль"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {errors.root && <p className="text-body-sm text-error-600">{errors.root.message}</p>}
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Зберегти новий пароль
      </Button>
    </form>
  );
}
