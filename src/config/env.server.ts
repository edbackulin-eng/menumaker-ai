import "server-only";
import { z } from "zod";

/**
 * Серверні секрети, що активно використовуються вже зараз (Supabase service
 * role, Turnstile). Імпорт цього файлу з клієнтського компонента є помилкою
 * білду завдяки пакету `server-only` — це навмисний захист від витоку секретів
 * у браузерний бандл.
 *
 * ВАЖЛИВО: секрети для ще не реалізованих інтеграцій (AI-провайдер, Stripe)
 * навмисно НЕ входять сюди. ES-модуль виконується цілком при імпорті будь-
 * якого одного експорту — якби AI/Stripe-змінні валідувались у цьому ж файлі,
 * імпорт `serverEnv` заради TURNSTILE_SECRET_KEY (Stage 4) впав би через
 * відсутні AI_PROVIDER_API_KEY/STRIPE_* (Stage 6/9 ще не настали). Кожна
 * майбутня інтеграція повинна отримати власний invalid `config/env.<name>.ts`
 * файл за цим самим зразком, а не додаватись сюди.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string({ message: "SUPABASE_SERVICE_ROLE_KEY є обов'язковою серверною змінною." })
    .min(1, "SUPABASE_SERVICE_ROLE_KEY не може бути порожньою."),
  TURNSTILE_SECRET_KEY: z
    .string({ message: "TURNSTILE_SECRET_KEY є обов'язковою серверною змінною." })
    .min(1, "TURNSTILE_SECRET_KEY не може бути порожньою."),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;

function loadServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  });

  if (!parsed.success) {
    const details = z.prettifyError(parsed.error);
    throw new Error(
      `❌ Некоректні серверні змінні середовища.\n${details}\n\nПеревірте файл .env.local (див. .env.example).`,
    );
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

/**
 * Лінивий проксі — та сама причина, що й у `env.ai.ts`. Додатковий нюанс тут:
 * `TURNSTILE_SECRET_KEY` у демо-оточенні порожній (авторизацію вимкнено), тож
 * top-level валідація завалила б будь-який серверний шлях, що транзитивно тягне
 * цей конфіг. Ключі читаються лениво: `TURNSTILE_SECRET_KEY` — у
 * `verifyTurnstileToken` (усередині заблокованих у демо auth-actions),
 * `SUPABASE_SERVICE_ROLE_KEY` — у `createServiceClient` (лише на важких,
 * заблокованих у демо шляхах). Тому в демо ці властивості не читаються ніколи.
 */
export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop) {
    return loadServerEnv()[prop as keyof ServerEnv];
  },
});
