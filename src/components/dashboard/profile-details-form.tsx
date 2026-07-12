"use client";

import { useState } from "react";

import { CURATED_LOCALES } from "@/config/profile";
import { ApiClientError } from "@/lib/api-client/api-client-error";
import { profileApi } from "@/lib/api-client/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export interface ProfileDetailsFormProps {
  initialFullName: string | null;
  initialLocale: string;
}

const LOCALE_OPTIONS = CURATED_LOCALES.map((locale) => ({ value: locale.id, label: locale.label }));

export function ProfileDetailsForm({ initialFullName, initialLocale }: ProfileDetailsFormProps) {
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [locale, setLocale] = useState(initialLocale);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    setIsSaving(true);
    try {
      await profileApi.update({
        full_name: fullName.trim(),
        locale: locale as (typeof LOCALE_OPTIONS)[number]["value"],
      });
      setStatus({ type: "success", message: "Збережено." });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof ApiClientError ? err.message : "Не вдалося зберегти профіль.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Ім'я"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        required
      />
      <Select label="Мова" options={LOCALE_OPTIONS} value={locale} onValueChange={setLocale} />
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
        Зберегти
      </Button>
    </form>
  );
}
