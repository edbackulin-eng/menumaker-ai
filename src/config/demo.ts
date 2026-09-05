import "server-only";

/**
 * DEMO_MODE — безпечний демо-режим для портфоліо-версії застосунку.
 *
 * Коли увімкнено (`DEMO_MODE=true`), усі «важкі» серверні операції блокуються
 * на бекенді (див. заслони в `lib/api/with-api-handler.ts`, server actions
 * авторизації/профілю, `app/auth/callback/route.ts` та `app/admin/layout.tsx`)
 * і повертають ввічливу відмову, а реальні платні API-ключі (Anthropic, Pexels)
 * та Turnstile-секрет ніколи не задіюються.
 *
 * Навмисно НАЙЛЕГШИЙ можливий модуль: читає лише один прапорець і НЕ імпортує
 * `env.ai` / `env.photos` / `env.server`. Заслон має спрацьовувати РАНІШЕ, ніж
 * код торкнеться цих конфігів (вони валідуються zod і падають на порожньому
 * ключі) — тому цей файл не тягне їх за собою. Пастку з їхньою top-level
 * валідацією окремо знято лінивим (Proxy) завантаженням у самих env.*-файлах.
 *
 * За замовчуванням `false` — прод-режим (`DEMO_MODE` не задано) працює точно
 * як раніше. Прапорець вимикається одним рухом і повністю відновлює продукт.
 */
export const isDemoMode = process.env.DEMO_MODE === "true";

/** Єдине повідомлення відмови для всіх заслонів — узгоджене між роутами й actions. */
export const DEMO_MODE_MESSAGE = "Ця дія недоступна в демо-режимі";

/**
 * Стандартизована відмова для server actions, що повертають `{ success, error }`
 * (замість кидка помилки — щоб форма показала повідомлення, а не error-сторінку).
 */
export function demoActionRejection(): { success: false; error: string } {
  return { success: false, error: DEMO_MODE_MESSAGE };
}
