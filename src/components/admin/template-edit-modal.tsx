"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { adminApi } from "@/lib/api-client/admin";
import type { AdminTemplate } from "@/lib/api-client/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function nameField(name: unknown, locale: "en" | "uk"): string {
  if (name && typeof name === "object" && !Array.isArray(name)) {
    const value = (name as Record<string, unknown>)[locale];
    if (typeof value === "string") return value;
  }
  return "";
}

export interface TemplateEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: AdminTemplate;
}

export function TemplateEditModal({ open, onOpenChange, template }: TemplateEditModalProps) {
  const router = useRouter();
  const [nameEn, setNameEn] = useState(nameField(template.name, "en"));
  const [nameUk, setNameUk] = useState(nameField(template.name, "uk"));
  const [sortOrder, setSortOrder] = useState(String(template.sort_order));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      await adminApi.updateTemplate(template.id, {
        name: { en: nameEn.trim(), uk: nameUk.trim() },
        sort_order: Number(sortOrder),
      });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не вдалося оновити шаблон.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редагувати шаблон</DialogTitle>
          <DialogDescription>{template.slug}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            label="Назва (англійською)"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
          />
          <Input
            label="Назва (українською)"
            value={nameUk}
            onChange={(e) => setNameUk(e.target.value)}
          />
          <Input
            label="Порядок відображення"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
        {error && <p className="text-body-sm text-error-600 mt-2">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button type="button" isLoading={isSaving} onClick={() => void handleSave()}>
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
