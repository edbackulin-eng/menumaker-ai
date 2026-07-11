import "server-only";
import { z } from "zod";

/**
 * AI-провайдер, окремий env-файл за патерном env.server.ts (Stage 4/5): кожна
 * інтеграція має власну схему, щоб імпорт serverEnv заради Turnstile-секрету
 * не падав через відсутність AI-змінних і навпаки.
 *
 * AI_PROVIDER — єдина точка конфігурації, яку читає provider-factory.ts;
 * додавання другого провайдера означає додати ще один enum-варіант тут і ще
 * один `case` у фабриці, а не змінювати виклики AI-функцій по всій кодовій базі.
 */
const aiEnvSchema = z.object({
  AI_PROVIDER: z.enum(["anthropic"]).default("anthropic"),
  ANTHROPIC_API_KEY: z
    .string({ message: "ANTHROPIC_API_KEY є обов'язковою серверною змінною." })
    .min(1, "ANTHROPIC_API_KEY не може бути порожньою."),
});

function loadAiEnv() {
  const parsed = aiEnvSchema.safeParse({
    AI_PROVIDER: process.env.AI_PROVIDER,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  });

  if (!parsed.success) {
    const details = z.prettifyError(parsed.error);
    throw new Error(
      `❌ Некоректні змінні середовища AI-провайдера.\n${details}\n\nПеревірте файл .env.local (див. .env.example).`,
    );
  }

  return parsed.data;
}

export const aiEnv = loadAiEnv();
