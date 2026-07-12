"use server";

import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/profile";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Unlike features/auth/actions.ts's updatePasswordAction (used right after
 * a password-reset email link, which redirects to /dashboard on success),
 * this one is triggered from an already-authenticated Profile page and
 * deliberately does NOT redirect — the user should stay put and just see a
 * success message.
 */
export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некоректні дані форми." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { success: false, error: "Не вдалося змінити пароль. Спробуйте ще раз." };
  }

  return { success: true };
}
