import "server-only";
import { z } from "zod";

/**
 * Серверні секрети. Імпорт цього файлу з клієнтського компонента є помилкою
 * білду завдяки пакету `server-only` — це навмисний захист від витоку секретів
 * у браузерний бандл.
 *
 * У Stage 1 ці змінні ще не використовуються жодним кодом (AI/Stripe/DB-логіка
 * додається на пізніших етапах), тому валідація не блокує білд, доки цей модуль
 * ніхто не імпортує. Щойно модуль буде підключено — відсутність значення
 * призведе до чіткої помилки під час білду/старту.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string({ message: "SUPABASE_SERVICE_ROLE_KEY є обов'язковою серверною змінною." })
    .min(1, "SUPABASE_SERVICE_ROLE_KEY не може бути порожньою."),
  AI_PROVIDER_API_KEY: z
    .string({ message: "AI_PROVIDER_API_KEY є обов'язковою серверною змінною." })
    .min(1, "AI_PROVIDER_API_KEY не може бути порожньою."),
  STRIPE_SECRET_KEY: z
    .string({ message: "STRIPE_SECRET_KEY є обов'язковою серверною змінною." })
    .min(1, "STRIPE_SECRET_KEY не може бути порожньою."),
  STRIPE_WEBHOOK_SECRET: z
    .string({ message: "STRIPE_WEBHOOK_SECRET є обов'язковою серверною змінною." })
    .min(1, "STRIPE_WEBHOOK_SECRET не може бути порожньою."),
});

function loadServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    AI_PROVIDER_API_KEY: process.env.AI_PROVIDER_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  });

  if (!parsed.success) {
    const details = z.prettifyError(parsed.error);
    throw new Error(
      `❌ Некоректні серверні змінні середовища.\n${details}\n\nПеревірте файл .env.local (див. .env.example).`,
    );
  }

  return parsed.data;
}

export const serverEnv = loadServerEnv();
