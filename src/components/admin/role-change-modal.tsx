"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { adminApi } from "@/lib/api-client/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";

export interface RoleChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userLabel: string;
  currentRole: "user" | "admin";
}

const ROLE_OPTIONS = [
  { value: "user", label: "Користувач" },
  { value: "admin", label: "Адміністратор" },
];

export function RoleChangeModal({
  open,
  onOpenChange,
  userId,
  userLabel,
  currentRole,
}: RoleChangeModalProps) {
  const router = useRouter();
  const [role, setRole] = useState<"user" | "admin">(currentRole);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setIsSaving(true);
    try {
      await adminApi.changeUserRole(userId, { role });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не вдалося змінити роль.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Змінити роль користувача?</DialogTitle>
          <DialogDescription>
            {userLabel} — зміна ролі впливає на доступ до Admin Panel. Дія фіксується в журналі
            аудиту.
          </DialogDescription>
        </DialogHeader>
        <Select
          label="Нова роль"
          options={ROLE_OPTIONS}
          value={role}
          onValueChange={(value) => setRole(value as "user" | "admin")}
        />
        {error && <p className="text-body-sm text-error-600 mt-2">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button
            type="button"
            isLoading={isSaving}
            disabled={role === currentRole}
            onClick={() => void handleConfirm()}
          >
            Змінити роль
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
