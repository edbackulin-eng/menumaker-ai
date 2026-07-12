"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { changePasswordAction } from "@/features/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const t = useTranslations("dashboard.changePassword");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    setIsSaving(true);
    const result = await changePasswordAction({ password, confirmPassword });
    if (result.success) {
      setStatus({ type: "success", message: t("saved") });
      setPassword("");
      setConfirmPassword("");
    } else {
      setStatus({ type: "error", message: result.error ?? t("error") });
    }
    setIsSaving(false);
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4" noValidate>
      <Input
        label={t("newPasswordLabel")}
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <Input
        label={t("confirmPasswordLabel")}
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
      />
      {status && (
        <p
          className={
            status.type === "success"
              ? "text-body-sm text-success-600"
              : "text-body-sm text-error-600"
          }
        >
          {status.message}
        </p>
      )}
      <Button type="submit" isLoading={isSaving} className="self-start">
        {t("submit")}
      </Button>
    </form>
  );
}
