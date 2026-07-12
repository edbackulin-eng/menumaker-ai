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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface GrantCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userLabel: string;
}

export function GrantCreditsModal({
  open,
  onOpenChange,
  userId,
  userLabel,
}: GrantCreditsModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = Number(amount);
  const canSubmit = Number.isInteger(parsedAmount) && parsedAmount > 0 && reason.trim().length >= 3;

  async function handleConfirm() {
    setError(null);
    setIsSaving(true);
    try {
      await adminApi.grantCredits(userId, { amount: parsedAmount, reason: reason.trim() });
      setAmount("");
      setReason("");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не вдалося нарахувати кредити.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Нарахувати кредити вручну</DialogTitle>
          <DialogDescription>
            {userLabel} — дія фіксується в журналі аудиту та в історії транзакцій користувача.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            label="Кількість кредитів"
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          <Textarea
            label="Причина нарахування"
            placeholder="Наприклад: компенсація за технічну помилку під час імпорту меню"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
          />
        </div>
        {error && <p className="text-body-sm text-error-600 mt-2">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button
            type="button"
            isLoading={isSaving}
            disabled={!canSubmit}
            onClick={() => void handleConfirm()}
          >
            Нарахувати
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
