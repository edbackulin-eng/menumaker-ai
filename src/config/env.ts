import { z } from "zod";

/**
 * Публічні (NEXT_PUBLIC_*) змінні середовища — потрапляють у браузерний бандл,
 * тому тут не повинно бути жодних секретів. Безпечно імпортувати з клієнтських
 * і серверних компонентів. Для серверних секретів див. `config/env.server.ts`.
 *
 * Значення читаються через прямі звернення до `process.env.NEXT_PUBLIC_*`,
 * оскільки Next.js підміняє такі звернення статично під час білду — динамічний
 * доступ (напр. `process.env[key]`) працювати не буде.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ message: "NEXT_PUBLIC_SUPABASE_URL є обов'язковою змінною середовища." })
    .url("NEXT_PUBLIC_SUPABASE_URL має бути коректною URL-адресою Supabase-проєкту."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ message: "NEXT_PUBLIC_SUPABASE_ANON_KEY є обов'язковою змінною середовища." })
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY не може бути порожньою."),
  NEXT_PUBLIC_APP_URL: z
    .string({ message: "NEXT_PUBLIC_APP_URL є обов'язковою змінною середовища." })
    .url("NEXT_PUBLIC_APP_URL має бути коректною URL-адресою застосунку."),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z
    .string({ message: "NEXT_PUBLIC_TURNSTILE_SITE_KEY є обов'язковою змінною середовища." })
    .min(1, "NEXT_PUBLIC_TURNSTILE_SITE_KEY не може бути порожньою."),
});

function loadPublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  });

  if (!parsed.success) {
    const details = z.prettifyError(parsed.error);
    throw new Error(
      `❌ Некоректні публічні змінні середовища.\n${details}\n\nПеревірте файл .env.local (див. .env.example).`,
    );
  }

  return parsed.data;
}

export const publicEnv = loadPublicEnv();
