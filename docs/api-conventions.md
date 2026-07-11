# API Conventions

Обов'язкові для всіх Route Handlers під `src/app/api/**`. Ціль: фронтенд парсить помилки й успішні відповіді однаково, незалежно від того, який ендпоінт викликано.

## Формат відповіді

**Успіх:**

```json
{ "data": { ... } }
```

Списки — з пагінацією:

```json
{ "data": { "items": [...], "page": 1, "limit": 20, "total": 42 } }
```

**Помилка:**

```json
{
  "error": {
    "code": "validation_error",
    "message": "Помилка валідації.",
    "details": { "title": ["Обов'язкове поле."] }
  }
}
```

`details` присутній лише для помилок валідації (мапа `поле → масив повідомлень`); для решти помилок — відсутній. `code` — стабільний machine-readable рядок (`snake_case`), фронтенд може перемикатись по ньому без парсингу `message` (який призначений для показу людині й може змінитись).

## HTTP статус-коди

| Код | Коли                                                                        | Клас помилки               |
| --- | --------------------------------------------------------------------------- | -------------------------- |
| 200 | Успішний GET/PATCH                                                          | —                          |
| 201 | Успішний POST (створено ресурс)                                             | —                          |
| 204 | Успішний DELETE (тіла немає)                                                | —                          |
| 400 | Некоректний запит на рівні транспорту (невалідний JSON)                     | `ApiError`                 |
| 401 | Немає активної сесії                                                        | `UnauthorizedError`        |
| 403 | Є сесія, але бракує ролі/права (напр. не admin)                             | `ForbiddenError`           |
| 404 | Ресурс не існує **або не належить користувачу**                             | `NotFoundError`            |
| 422 | Тіло/query коректний JSON, але не проходить zod-схему                       | `ValidationError`          |
| 429 | Перевищено rate limit (з заголовком `Retry-After`)                          | `RateLimitError`           |
| 402 | Недостатньо кредитів (зарезервовано під AI/Menu Generator етапи)            | `InsufficientCreditsError` |
| 500 | Неочікувана помилка — деталі йдуть лише в лог, клієнту generic-повідомлення | —                          |

**403 vs 404 для власності ресурсу**: навмисно **404**, не 403, коли користувач A звертається до ресурсу користувача B. RLS (Етап 2) і так фільтрує рядки без сесії власника — з точки зору API рядка просто не існує. 403 залишається для випадків, коли роль/право явно перевіряється окремо від власності (наприклад `requireAdmin()` на майбутніх admin-ендпоінтах): там сам факт існування ресурсу не секрет, бракує саме дозволу.

## Валідація

Кожен Route Handler валідує body/query/params через zod-схему **до** будь-якого звернення до БД — `src/lib/api/validate-request.ts` (`validateBody`, `validateQuery`, `validateParams`). Невалідні дані кидають `ValidationError` (перехоплюється централізовано, див. нижче) із `details`, згенерованими вручну з `ZodError.issues` (мапа `поле → повідомлення[]`).

## Обробка помилок

Кожен Route Handler обгортається в `withApiHandler()` (`src/lib/api/with-api-handler.ts`), який:

1. Перевіряє rate limit (див. нижче) до виконання handler-функції.
2. Ловить кинуті помилки:
   - `ApiError` (і підкласи) → серіалізує в `{ error }` з відповідним статусом.
   - Будь-яка інша помилка → логується як `error` (з stack trace, лише на сервері) і повертається generic `500` без деталей імплементації.
3. Логує повільні запити (>1s).

Бізнес-логіка Route Handler ніколи не формує HTTP-відповідь помилки вручну — лише кидає відповідний клас з `src/lib/errors/`.

## Авторизація

- `requireAuth()` — кидає `UnauthorizedError`, якщо немає сесії; повертає `{ user, supabase }` (типізований серверний клієнт, прив'язаний до сесії користувача — усі подальші запити йдуть через RLS).
- `requireAdmin()` — те саме + перевіряє `profiles.role === 'admin'`, інакше `ForbiddenError`.

Це **другий шар** захисту понад RLS: RLS гарантує, що дані фізично недосяжні навіть в разі бага в Route Handler; `requireAuth`/`requireAdmin` дають явну, консистентну помилку замість мовчазної порожньої відповіді.

## Rate Limiting

Postgres-таблиця `api_rate_limits` (fixed-window лічильник, атомарний upsert через SQL-функцію `check_rate_limit()`) — не in-memory, коректно працює на кількох serverless-інстансах Vercel. Той самий підхід, що й `auth_rate_limits` з Етапу 4, але для загального API-трафіку (не login-специфічний lockout).

Конфігурація — `src/lib/api/rate-limit-config.ts`:

```ts
export const API_RATE_LIMITS = {
  authenticated: { limit: 60, windowSeconds: 60 },
  public: { limit: 20, windowSeconds: 60 },
};
```

Ключ: `api:user:<uuid>` для автентифікованих запитів, `api:ip:<ip>` для публічних (з `x-forwarded-for`). Кожен Route Handler явно вказує свій rate-limit tier при виклику `withApiHandler(handler, { rateLimitTier: 'authenticated' | 'public' })`.

Перевищення → `429` з `Retry-After` (секунди до кінця вікна).

**Компроміс**: fixed window, не sliding — простіше й досить для цієї стадії, ціна — теоретичний сплеск до ~2x ліміту на межі вікна. Прийнятно для загального API rate limiting (не для критичних фінансових операцій).

## Логування

`src/lib/logger.ts` (pino) — структуровані NDJSON-записи в stdout (сумісно з Vercel), pretty-friendly формат лише в development.

Обов'язкові точки логування (реалізовано в `withApiHandler`):

- Помилки `5xx` — `logger.error({ err, path, method }, ...)`, зі stack trace на сервері, ніколи не в клієнтській відповіді.
- Повільні запити (>1s) — `logger.warn({ path, method, durationMs }, ...)`.
- Rate-limit спрацювання — `logger.warn({ key, path }, 'rate_limit_exceeded')`.

## Видалення ресурсів: hard delete, не soft delete

Для `menus` (і похідних) обрано **hard delete**, не `deleted_at`-колонку:

1. `menu_exports.menu_id` вже має `on delete cascade` (Етап 2) — схема вже спроєктована під hard delete; додавання soft-delete зараз означало б або ламати цей каскад, або дублювати фільтрацію `deleted_at is null` у кожному майбутньому запиті/RLS-політиці, що торкається `menus`.
2. На відміну від `credits_transactions`/`payments` (навмисно незмінні аудит-логи), `menus` — user-editable контент без вимоги збереження історії видалень цим етапом.
3. Якщо в майбутньому знадобиться "кошик"/відновлення — це окрема, свідома фіча з власною міграцією (`deleted_at` + оновлені RLS-політики + UI), а не щось, що варто закладати заздалегідь без явної вимоги (уникнення передчасної абстракції).

## Типізовані клієнти для фронтенду

`src/lib/api-client/` — обгортки на кшталт `menusApi.list()/get()/create()/update()/remove()`, типізовані через `Tables<'menus'>`/`TablesInsert<'menus'>`/`TablesUpdate<'menus'>` з `database.types.ts`. Кидають `ApiClientError` (окремий клас для клієнтського коду) із тим самим `code`/`message`/`details`, що прийшли з API — Server/Client Components відрізняють типи помилок однаково.
