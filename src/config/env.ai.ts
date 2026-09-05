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

type AiEnv = z.infer<typeof aiEnvSchema>;

let cachedAiEnv: AiEnv | null = null;

function loadAiEnv(): AiEnv {
  if (cachedAiEnv) return cachedAiEnv;

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

  cachedAiEnv = parsed.data;
  return cachedAiEnv;
}

/**
 * Лінивий проксі: валідація ключів відкладена до ПЕРШОГО реального доступу до
 * властивості (перший AI-виклик), а не виконується під час import цього модуля.
 * Критично для DEMO_MODE — route-файли на import транзитивно тягнуть цей конфіг;
 * якби `loadAiEnv()` виконувався тут, порожній `ANTHROPIC_API_KEY` у демо-
 * оточенні завалив би завантаження роуту 500-кою ще до того, як демо-заслон у
 * `with-api-handler` встиг би повернути ввічливу 403. Усі споживачі читають ключі
 * лениво (конструктор `AnthropicProvider`, функція `getAIProvider`), тому доступ
 * до властивості настає лише коли операція реально виконується — у демо ніколи.
 * У проді поведінка незмінна: перший доступ валідує і кидає ту саму помилку.
 */
export const aiEnv: AiEnv = new Proxy({} as AiEnv, {
  get(_target, prop) {
    return loadAiEnv()[prop as keyof AiEnv];
  },
});
