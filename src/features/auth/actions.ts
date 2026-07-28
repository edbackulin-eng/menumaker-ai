"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { publicEnv } from "@/config/env";
import { redirect } from "@/i18n/navigation";
import { checkLoginLock, recordLoginFailure, recordLoginSuccess } from "@/lib/auth/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { parseAcceptLanguage } from "@/lib/utils/locale";
import {
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export interface ActionResult {
  success: boolean;
  error?: string;
}

async function getRequestMeta() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return {
    acceptLanguage: headerList.get("accept-language"),
    remoteIp: forwardedFor?.split(",")[0]?.trim(),
  };
}

export async function signUpAction(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некоректні дані форми." };
  }
  const { email, password, turnstileToken } = parsed.data;

  const { acceptLanguage, remoteIp } = await getRequestMeta();

  const isHuman = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!isHuman) {
    return { success: false, error: "Перевірка CAPTCHA не пройдена. Спробуйте ще раз." };
  }

  const locale = parseAcceptLanguage(acceptLanguage);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { locale } },
  });

  if (error) {
    if (/already registered|already exists|user_already_exists/i.test(error.message)) {
      return { success: false, error: "Акаунт з таким email вже існує. Спробуйте увійти." };
    }
    return { success: false, error: "Не вдалося зареєструватись. Спробуйте пізніше." };
  }

  // registerSchema already required `consent: true` above — this is the
  // legal record of it. Written via the service-role client (not the
  // session client `supabase` already in scope): `terms_accepted_at` is
  // protected by the same trigger that guards `role`/`subscription_*`
  // (Stage 15.6 migration), so an ordinary authenticated update would be
  // rejected even from the user's own just-created row.
  if (data.user) {
    const admin = createServiceClient();
    await admin
      .from("profiles")
      .update({ terms_accepted_at: new Date().toISOString() })
      .eq("id", data.user.id);
  }

  return redirect({ href: "/dashboard", locale: await getLocale() });
}

export async function signInAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некоректні дані форми." };
  }
  const { email, password } = parsed.data;

  const lock = await checkLoginLock(email);
  if (lock.locked) {
    const minutes = Math.ceil(lock.retryAfterSeconds / 60);
    return {
      success: false,
      error: `Забагато невдалих спроб входу. Спробуйте знову через ${minutes} хв.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await recordLoginFailure(email);
    return { success: false, error: "Невірний email або пароль." };
  }

  await recordLoginSuccess(email);
  return redirect({ href: "/dashboard", locale: await getLocale() });
}

export async function resetPasswordRequestAction(
  input: ForgotPasswordInput,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некоректні дані форми." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });

  // Always report success — confirming/denying account existence here would
  // let an attacker enumerate registered emails.
  return { success: true };
}

export async function updatePasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некоректні дані форми." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      success: false,
      error: "Не вдалося оновити пароль. Спробуйте запросити нове посилання.",
    };
  }

  return redirect({ href: "/dashboard", locale: await getLocale() });
}

export async function signOutAction(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect({ href: "/login", locale: await getLocale() });
}
