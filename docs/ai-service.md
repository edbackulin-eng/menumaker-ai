# AI Service Layer

Архітектура прошарку `src/services/ai/`, що інкапсулює роботу з AI-моделлю: бізнес-логіка (Route Handlers, а в майбутньому — Menu Generator) ніколи не звертається до `@anthropic-ai/sdk` напряму.

## Абстракція провайдера

```
src/services/ai/
  types.ts                       — інтерфейс AIProvider (complete, completeStructured)
  provider-factory.ts            — getAIProvider(): єдина точка, що читає AI_PROVIDER
  providers/anthropic-provider.ts — конкретна реалізація через Anthropic SDK
  schemas/menu-content.ts        — канонічна zod-схема для menus.content
  functions/*.ts                 — 6 бізнес-функцій поверх AIProvider
  credit-guard.ts                — інтеграція з кредитами
```

`AIProvider` — контракт, не прив'язаний до жодного SDK:

```ts
interface AIProvider {
  complete(params): Promise<{ text: string; usage: AIUsage }>;
  completeStructured<T>(params: { schema: ZodType<T>; ... }): Promise<{ data: T; usage: AIUsage }>;
}
```

`getAIProvider()` (`provider-factory.ts`) — сінглтон, що мапить `AI_PROVIDER` (`config/env.ai.ts`) на конкретну реалізацію. Додавання другого провайдера (наприклад OpenAI) означає: реалізувати `AIProvider` у новому файлі під `providers/` і додати один `case` у фабриці — жоден виклик у `functions/*.ts` чи Route Handlers не змінюється.

## Модель

**`claude-haiku-4-5-20251001`** — пінований (dated) ідентифікатор, не dateless-аліас `claude-haiku-4-5`, звірений з офіційною таблицею моделей Anthropic (`platform.claude.com/docs/en/about-claude/models/overview`) на момент реалізації цього етапу. Пінований ID гарантує, що поведінка моделі не зміниться непомітно під застосунком; апгрейд — свідома зміна одного рядка в `anthropic-provider.ts`, а не автоматичний side-effect деплою. Обрано як бюджетний варіант для MVP ($1/$5 за MTok input/output) відповідно до рішення PO.

## Структурований вивід і retry-стратегія

Замість інструменту `tool_use` (що вимагав би конвертації zod-схем у JSON Schema й нової залежності) використовується **prefill-трюк**, задокументований самим Anthropic SDK: остання репліка в `messages` — це `{ role: "assistant", content: "{" }`, через що модель продовжує відповідь одразу з JSON-об'єкта. API повертає лише продовження (без самого `"{"`), тому `anthropic-provider.ts` дописує його назад перед `JSON.parse`.

Retry відбувається на двох незалежних рівнях:

1. **Загальний (`AnthropicProvider.completeStructured`)** — якщо перша відповідь не парситься як JSON або не проходить zod-схему, робиться ОДНА повторна спроба з уточненим промтом, що явно описує, яка саме помилка сталася. Якщо і друга спроба провалюється — кидається `AIOutputValidationError` (502), запит не повертає клієнту сирий/невалідний результат.
2. **Специфічний для `translateMenu`** — окрім JSON-валідності, критично важливо зберегти точну кількість категорій/страв (щоб не загубити страву при перекладі). Це бізнес-інваріант, який неможливо виразити самою zod-схемою елемента, тому `translateMenu` робить власну додаткову перевірку довжин масивів і, за потреби, ще один retry з явною вимогою повернути точну кількість елементів.

Функції з простим текстовим виводом (`fixText`, `generateDescription`) використовують `complete()` замість `completeStructured()` — не JSON, а прямий текст, що дешевше й простіше. Для них є окремий, простіший retry-хелпер `complete-with-retry.ts` (одна повторна спроба, якщо вивід не пройшов свою zod-схему, наприклад порожній рядок).

## Обробка помилок провайдера

`src/lib/errors/api-error.ts` (Stage 5) доповнено двома класами:

- **`AIProviderError`** (502) — мережева помилка, timeout, rate limit чи 5xx від самого Anthropic. `retryable` — інформаційний прапор для логів.
- **`AIOutputValidationError`** (502) — провайдер відповів, але вивід не пройшов zod-схему навіть після retry.

Обидва — підкласи `ApiError`, тому `withApiHandler` (Stage 5) обробляє їх так само, як і решту: логує (`api_error`, бо статус ≥500) і повертає клієнту `{ error: { code, message } }` без деталей імплементації.

## Схема `menus.content`

`menus.content` (Stage 2) навмисно залишена без схеми на рівні БД (`jsonb not null default '{}'::jsonb`). Цей етап вперше визначає її канонічну форму — `src/services/ai/schemas/menu-content.ts`:

```ts
{
  currency?: string,
  categories: [{ name: string, items: [{ name: string, description?: string, price?: number }] }]
}
```

Валідується на рівні застосунку (zod), не БД-обмеженням — форма може еволюціонувати без міграції. `analyzeMenu`, `structureMenu` і `translateMenu` читають/повертають саме цю форму.

## Інтеграція з кредитами

`src/services/ai/credit-guard.ts` (`runCreditedAiCall`) — єдина точка, через яку кожен AI Route Handler проходить:

1. Читає ціну дії з `credit_costs.action_type` (не хардкод — керується PO через БД, Stage 10 дасть Admin UI).
2. Попередньо перевіряє баланс (`credits_balance`) — рання відмова `InsufficientCreditsError`, щоб не витрачати гроші на виклик AI, якщо і так очевидно, що не вистачить.
3. Виконує AI-виклик. Якщо він падає — кредити НЕ списуються (обробляється просто прокиданням помилки до `catch`, до якого списання ще не дійшло).
4. Лише після успіху — атомарне списання через SQL-функцію `spend_credits()` (нова міграція `20260711140000_ai_credit_functions.sql`): одна `UPDATE ... WHERE balance >= p_amount RETURNING` (race-safe сама по собі) + `INSERT` у `credits_transactions` в одній неявній транзакції функції. Якщо між кроком 2 і 4 баланс встиг змінитись (конкурентний запит) — списання не відбувається, і застосунок "з'їдає" вартість виклику AI-провайдера сам, а не віддає неоплачений результат.

### Мапінг дій на `credit_costs.action_type` / `credits_transactions.type`

`credit_costs.action_type` — довільний текстовий ключ (ціноутворення без міграції). `credits_transactions.type` — фіксований enum (Stage 2), навмисно грубіший за `action_type`: кілька дій можуть належати до однієї категорії обліку.

| Функція               | `action_type`      | `type` (ledger)    |
| --------------------- | ------------------ | ------------------ |
| `analyzeMenu`         | `menu_generation`  | `menu_generation`  |
| `structureMenu`       | `menu_structuring` | `menu_generation`  |
| `fixText`             | `text_fix`         | `menu_generation`  |
| `translateMenu`       | `menu_translation` | `menu_translation` |
| `generateDescription` | `ai_description`   | `ai_description`   |
| `suggestImprovements` | `ai_improvement`   | `ai_description`   |

`menu_generation`/`menu_translation`/`ai_description`/`ai_improvement` вже існували в seed-даних Stage 2 (передбачали саме ці 4 функції); `menu_structuring` і `text_fix` додані цим етапом через `INSERT ... ON CONFLICT DO NOTHING` (нова міграція), а не через розширення enum `credit_transaction_type` — обидві дії семантично належать до категорії "підготовка контенту меню", і `credit_costs.action_type` + `credits_transactions.description` разом дають достатню деталізацію для майбутнього моніторингу вартості без роздування фіксованого enum.

## Ліміти

- **Rate limit**: окремий, суворіший рівень `ai` (10 запитів/хв на користувача) у `src/lib/api/rate-limit-config.ts`, незалежний від загального `authenticated` (60/хв, Stage 5) — тому що AI-виклики коштують реальних грошей. Виправлено супутній баг у `src/lib/api/rate-limit.ts`: ключ лічильника раніше не залежав від tier (`api:user:<id>` для будь-якого нерівного `public` tier), через що два різні tier для одного користувача ділили б один і той самий лічильник у Postgres. Ключ тепер префіксується tier'ом (`api:<tier>:user:<id>`).
- **Довжина вхідного тексту**: `analyzeMenu`/`fixText` обмежені 20 000 символами (`MAX_RAW_TEXT_LENGTH`, `src/lib/validations/ai.ts`) — це явна `422`-помилка валідації, не мовчазне обрізання.
- **Кредити** (див. вище) — природний ліміт на основі балансу, незалежний від rate limit.

## Логування

Кожен AI-виклик логується через `pino` (`credit-guard.ts`, доповнює три обов'язкові точки Stage 5):

- `ai_call_succeeded` (info) — `actionType`, `userId`, `cost`, `inputTokens`, `outputTokens`, `durationMs`.
- `ai_call_failed_no_charge` (warn) — коли сам AI-виклик кинув помилку (провайдер/валідація виводу), до списання кредитів справа не дійшла.
- `credit_spend_failed_after_ai_success` (error) — рідкісний race-кейс: AI відповів, але списати кредити не вдалося.

## Обсяг цього етапу

- 5 з 6 функцій мають власний API endpoint (`POST /api/ai/*`). **`structureMenu` навмисно без ендпоінта** — за прямою вказівкою специфікації етапу (розділ 5 переліковує лише 5 маршрутів). Це внутрішня функція для майбутнього пайплайна імпорту файлів (Stage 7: PDF/Word/Excel → сирий текст → `analyzeMenu`/`structureMenu`). Реальне тестування з живим API-ключем виконано напряму через виклик функції (включно з повною інтеграцією кредитів через `runCreditedAiCall`), а не через HTTP — див. звіт етапу.
- Реалізація не покриває генерацію зображень і імпорт файлів — за умовами етапу.
