# Демо-вітрина дашборда — звіт про реалізацію

> Згенеровано: 2026-09-06. Реалізовано за картою [docs/demo-dashboard-map.md](demo-dashboard-map.md).
> Усе нове — строго під `if (isDemoMode)`; прод (`DEMO_MODE=false`) незмінний.
> Type-check і ESLint по всіх зачеплених файлах — чисто. Деплой не запускався.

---

## 1. Змінені / створені файли (13)

| Файл                                                      | Зміна                                                            |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/lib/auth/get-current-user.ts`                        | **Крок 1** — `DEMO_USER` (role `user`), повертається до Supabase |
| `src/proxy.ts`                                            | **Крок 2** — не редиректити protected-шляхи у демо               |
| `src/services/dashboard/get-summary.ts`                   | **Крок 3** — `DEMO_SUMMARY` (експортовано), рання гілка          |
| `src/app/[locale]/(dashboard)/layout.tsx`                 | демо: без `createClient()`, summary з коду                       |
| `src/app/[locale]/(dashboard)/dashboard/page.tsx`         | **Крок 3/4** — демо-гілка з 3D-каруселлю без БД                  |
| `src/app/[locale]/(dashboard)/dashboard/credits/page.tsx` | демо: без `createClient()`, summary з коду                       |
| `src/app/[locale]/(dashboard)/dashboard/history/page.tsx` | демо: транзакції з коду                                          |
| `src/components/shared/demo-unavailable.tsx`              | **новий** — заглушка «недоступно в демо»                         |
| `src/app/[locale]/menus/new/page.tsx`                     | **Крок 5** — ранній `<DemoUnavailable/>` до `createClient`       |
| `src/app/[locale]/menus/[id]/editor/page.tsx`             | **Крок 5** — те саме                                             |
| `src/app/[locale]/menus/[id]/review/page.tsx`             | **Крок 5** — те саме                                             |
| `src/app/[locale]/menus/[id]/template/page.tsx`           | **Крок 5** — те саме                                             |
| `src/app/[locale]/menus/[id]/result/page.tsx`             | **Крок 5** — те саме                                             |

**Не редагувалися:** `dashboard/profile/page.tsx` і `dashboard/credits/upgrade/page.tsx` — вони й так звертаються лише через `getCurrentUser`, тож стали автономними після кроку 1. Форми профілю (аватар, зміна пароля, деталі, видалення акаунту) лишаються заблокованими раніше реалізованими бекенд-заслонами.

---

## 2. Автономність від Supabase — де була залежність і як знято

| Точка                                      | Була залежність                                                                            | Як знято                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Гейт `getCurrentUser` (layout + усі pages) | `auth.getUser()` + `SELECT profiles`                                                       | `if (isDemoMode) return DEMO_USER` — до `createClient`                                                                                             |
| Dashboard layout                           | `createClient()` + `getDashboardSummary`                                                   | `DEMO_SUMMARY` напряму, `createClient` не викликається                                                                                             |
| Головна `dashboard/page`                   | `menus`, `menu_templates`, `assertMenuCreationEligible`, `getDashboardSummary` (4+ запити) | демо-гілка `return` **до** `createClient`; стилі слайдів — `resolveTemplateDefaults({config:null, engine, palette:null})` замість `menu_templates` |
| `credits/page`                             | `createClient()` + `getDashboardSummary`                                                   | `DEMO_SUMMARY`, `createClient` не викликається                                                                                                     |
| `history/page`                             | прямий `credits_transactions`                                                              | демо-гілка з `DEMO_SUMMARY.recentTransactions` до `createClient`                                                                                   |
| `get-summary`                              | 4 запити `Promise.all`                                                                     | `if (isDemoMode) return DEMO_SUMMARY` перед ними                                                                                                   |
| `menus/*` (майстер/редактор)               | `menus`/`menu_templates`                                                                   | `<DemoUnavailable/>` до `createClient`                                                                                                             |

**Підтвердження:** на всіх демо-сторінках гілка повертає результат **до** `createClient()` / `from()` / `auth.getUser()`. Type-check + ESLint = чисто.

**Один чесний нюанс (proxy.ts):** middleware на кожен запит конструює Supabase-клієнт і викликає `supabase.auth.getUser()`. Для гостя **без сесійного cookie** SDK коротко замикає на `{ user: null }` без мережевого round-trip до Supabase — реального запиту немає. Supabase у proxy свідомо не чіпався, щоб не зламати рефреш сесії та locale-роутинг у проді; у демо це фактично no-op.

---

## 3. Рішення для показу каруселі (крок 3)

Обрано **примусовий показ EmptyState-каруселі** (демо-гілка `dashboard/page.tsx` одразу рендерить `EmptyState` з `MenuPreviewShowcase`), а не наповнення списку картками.

**Чому:** картки меню (`MenuCard`) містять кнопки «Редагувати» (Link → `/menus/[id]/editor`) і виклики `menusApi` — у демо це або впиралося б у заглушку редактора з фейковим id, або показувало б помилки заслону просто в картці. EmptyState-карусель — чиста вітрина 4 рушіїв (Modern / Grid / Bistro / Editorial), без жодної проблемної навігації, і саме вона демонструє ключову фічу продукту.

**Стилі слайдів** беруться з дефолтів рушіїв (`resolveTemplateDefaults` з `null`-джерелом і заданим `engine`), тому таблиця `menu_templates` (єдина залежність каруселі від БД за картою) більше не потрібна. Назви слайдів — константа `DEMO_ENGINE_LABELS` у коді.

---

## 4. Адмінка закрита + важкі кнопки ведуть на заглушку

**Адмінка закрита (три бар'єри):**

- `DEMO_USER.role = "user"` (ніколи не `admin`);
- `admin/layout.tsx` має власний `if (isDemoMode) redirect("/")` (з попереднього етапу) + перевірку `role !== "admin"`;
- proxy для `/admin` без сесії редиректить на `/login`.

**Кнопки вглиб на заглушці:**

- «Нове меню» (сайдбар, EmptyState) веде на `/menus/new` → тепер рендерить `<DemoUnavailable/>` («Ця дія недоступна в демо-режимі» + «← До дашборда»), а не майстер;
- усі сторінки майстра/редактора (`new`, `editor`, `review`, `template`, `result`) показують ту саму заглушку;
- мутаційні кнопки (дублювати / видалити / зберегти / фото / експорт) лишаються заблокованими раніше реалізованими бекенд-заслонами (403 / `demoActionRejection`).

---

## 5. Заготовлені демо-дані

- **`DEMO_USER`** (`get-current-user.ts`): `id: "demo-guest"`, `email: guest@demo.local`, `full_name: "Demo Guest"`, `locale: "en"`, `role: "user"`.
- **`DEMO_SUMMARY`** (`get-summary.ts`): 3 меню, баланс 12 кредитів, 1 використане безкоштовне меню, creditBlock (12/20, 60%), 2 демо-транзакції (menu_generation −1, bonus +20). Використовується сайдбаром, `credits` і `history`.
- **Карусель** рендерить `DEMO_MENU_CONTENT` з `config/demo-menu-preview.ts` (англ., локальні фото `public/demo-menu/*.webp`) — жодних зовнішніх доменів.

---

## 6. Гарантії прод-режиму

Усе нове — під `if (isDemoMode)` або тернар з гілкою `await createClient()`. Жоден робочий код не видалено; при `DEMO_MODE=false` кожен файл виконує стару логіку без змін. Заслони DEMO_MODE та `demo-menu.ts` (публічна `/m`) не зачіпалися.

---

_Кінець звіту._
