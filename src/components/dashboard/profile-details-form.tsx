"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { profileApi } from "@/lib/api-client/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ProfileDetailsFormProps {
  initialFullName: string | null;
}

export function ProfileDetailsForm({ initialFullName }: ProfileDetailsFormProps) {
  const t = useTranslations("dashboard.profile");
  const tButtons = useTranslations("common.buttons");
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    setIsSaving(true);
    try {
      await profileApi.update({ full_name: fullName.trim() });
      setStatus({ type: "success", message: t("saved") });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof ApiClientError ? err.message : t("saveError"),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4" noValidate>
      <Input
        label={t("nameLabel")}
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
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
        {tButtons("save")}
      </Button>
    </form>
  );
}
