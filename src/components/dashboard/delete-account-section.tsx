"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { profileApi } from "@/lib/api-client/profile";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface DeleteAccountSectionProps {
  email: string;
}

export function DeleteAccountSection({ email }: DeleteAccountSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmEmail.trim().toLowerCase() === email.toLowerCase();

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      await profileApi.deleteAccount();
      // The account (and its session) no longer exists server-side; sign
      // out client-side too so no stale session lingers in the browser.
      await createClient().auth.signOut();
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не вдалося видалити акаунт.");
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border-error-400/30">
      <CardHeader>
        <CardTitle>Небезпечна зона</CardTitle>
        <CardDescription>
          Видалення акаунту незворотне — усі ваші меню й дані буде втрачено назавжди.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="destructive" onClick={() => setIsOpen(true)}>
          Видалити акаунт
        </Button>
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити акаунт назавжди?</DialogTitle>
            <DialogDescription>
              Цю дію неможливо скасувати. Усі ваші меню, кредити й історія будуть видалені назавжди.
              Щоб підтвердити, введіть свій email ({email}) нижче.
            </DialogDescription>
          </DialogHeader>
          <Input
            label="Email для підтвердження"
            value={confirmEmail}
            onChange={(event) => setConfirmEmail(event.target.value)}
            placeholder={email}
            autoComplete="off"
          />
          {error && <p className="text-body-sm text-error-600 mt-2">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Скасувати
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!canConfirm}
              isLoading={isDeleting}
              onClick={() => void handleDelete()}
            >
              Видалити назавжди
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
