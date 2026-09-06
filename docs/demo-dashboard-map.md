# Карта дашборда для DEMO-вітрини (розвідка)

> Згенеровано: 2026-09-06. Тільки читання — жодних змін у коді.
> Мета: у `DEMO_MODE` гість БЕЗ входу бачить повноцінний дашборд із 3D-перегортуванням
> на заготовлених даних; усі важкі кнопки лишаються заблокованими (заслони DEMO_MODE
> вже реалізовані раніше, їх не чіпаємо).

---

## 1. Головний екран після входу та під-екрани

**Головна стор" дашборда (My Menus):** [src/app/[locale]/(dashboard)/dashboard/page.tsx](<src/app/[locale]/(dashboard)/dashboard/page.tsx>)
Це «Мої меню» — список карток меню користувача, або (якщо меню немає) EmptyState із 3D-каруселлю прикладів.

**Спільний layout усіх під-екранів:** [src/app/[locale]/(dashboard)/layout.tsx](<src/app/[locale]/(dashboard)/layout.tsx>) — сайдбар + шапка + мобільна навігація.

**Під-екрани (група `(dashboard)`):**

| Маршрут                      | Файл                                 | Що показує                                       |
| ---------------------------- | ------------------------------------ | ------------------------------------------------ |
| `/dashboard`                 | `dashboard/page.tsx`                 | Мої меню (список / EmptyState-карусель)          |
| `/dashboard/credits`         | `dashboard/credits/page.tsx`         | Баланс кредитів, транзакції                      |
| `/dashboard/credits/upgrade` | `dashboard/credits/upgrade/page.tsx` | Придбання кредитів (Stripe призупинено)          |
| `/dashboard/history`         | `dashboard/history/page.tsx`         | Історія транзакцій                               |
| `/dashboard/profile`         | `dashboard/profile/page.tsx`         | Профіль, аватар, зміна пароля, видалення акаунту |

**Навігація сайдбару:** [src/components/dashboard/dashboard-nav-items.ts](src/components/dashboard/dashboard-nav-items.ts) + [dashboard-sidebar.tsx](src/components/dashboard/dashboard-sidebar.tsx). Кнопка «Нове меню» → `/menus/new`.

**Майстер створення меню (група `menus`, поза `(dashboard)`, але той самий гейт):**
`/menus/new` (Import) → `/menus/[id]/review` → `/menus/[id]/template` → `/menus/[id]/editor` → `/menus/[id]/result`.

---

## 2. 3D-перегортування

**Клієнтський 3D-компонент:** [src/components/dashboard/menu-preview-carousel.tsx](src/components/dashboard/menu-preview-carousel.tsx)

- Перегортує **4 приклади меню в 4 різних дизайн-рушіях** (Modern / Grid / Bistro / Editorial).
- Чистий CSS 3D-transform (`rotateY(±35deg) scale(.88)`, `perspective:1200`), без бібліотек; автоплей 4с/слайд, пауза на `mousemove`/focus, повага до `prefers-reduced-motion`, адаптивний масштаб через `ResizeObserver`.
- Слайди приходять як **готовий RSC-payload** (проп `content: ReactNode`) — код рушіїв у клієнтський бандл не потрапляє.

**Серверна половина:** [src/components/dashboard/menu-preview-showcase.tsx](src/components/dashboard/menu-preview-showcase.tsx)

- Рендерить кожен слайд через `MenuStaticView` з **`DEMO_MENU_CONTENT` із [src/config/demo-menu-preview.ts](src/config/demo-menu-preview.ts)** (це окремий короткий приклад для каруселі, англ., 1 категорія, 3 фото — НЕ той самий, що `src/config/demo-menu.ts` для публічної /m).

**Звідки бере дані:** контент слайдів — статична константа `DEMO_MENU_PREVIEW` (з коду, без БД). АЛЕ стилі/назви шаблонів (`previewSlides`) `dashboard/page.tsx` бере з БД: `supabase.from("menu_templates").select(...)` — тобто самі 4 стилі підтягуються з таблиці `menu_templates`. Фото — локальні `public/demo-menu/*.webp`, без зовнішніх доменів.

> Важливо для демо: карусель показується лише у гілці EmptyState (`items.length === 0`). У демо треба або віддати гостю порожній список меню (тоді покажеться карусель), або окремо змусити цю гілку.

---

## 3. Прив'язка до акаунта — де стоять гейти (головне)

Гість зараз НЕ потрапить у дашборд через **три накладені гейти**:

**Гейт 1 — middleware (оптимістичний редирект):** [src/proxy.ts](src/proxy.ts)

- `PROTECTED_PREFIXES = ["/dashboard", "/menus"]` (рядок 16).
- Рядки 233-242: якщо шлях під цими префіксами і `!user` → `redirect(/{locale}/login?next=...)`.
- `user` беруть з `supabase.auth.getUser()` (рядок 134-136).

**Гейт 2 — layout дашборда (авторитетна перевірка):** [src/app/[locale]/(dashboard)/layout.tsx:21-24](<src/app/[locale]/(dashboard)/layout.tsx>)

```ts
const user = await getCurrentUser();
if (!user) {
  return redirect({ href: "/login", locale });
}
```

Далі рядки 31-32: `createClient()` + `getDashboardSummary(supabase, user.id)` — Supabase-запити для сайдбару.

**Гейт 3 — кожна сторінка окремо:** та сама пара в [dashboard/page.tsx:66-69](<src/app/[locale]/(dashboard)/dashboard/page.tsx>), [menus/new/page.tsx:29-32](src/app/[locale]/menus/new/page.tsx), [menus/[id]/editor/page.tsx:32-35](src/app/[locale]/menus/[id]/editor/page.tsx) тощо (патерн «proxy — швидкий редирект, page/layout — справжній гейт», Stage 4).

**Спільне джерело істини гостя:** [src/lib/auth/get-current-user.ts:23-33](src/lib/auth/get-current-user.ts) — `getCurrentUser()` = `supabase.auth.getUser()` + `SELECT * FROM profiles`. Для гостя повертає `null` → усі три гейти дають редирект на `/login`.

> Це і є те, що не пустить гостя. У демо треба, щоб `getCurrentUser()` (або гейти) віддавали синтетичного демо-користувача замість `null`, БЕЗ звернення до Supabase Auth.

---

## 4. Джерела даних дашборда (усе через Supabase)

**Layout** ([layout.tsx](<src/app/[locale]/(dashboard)/layout.tsx>)):

- `getCurrentUser()` → `auth.getUser()` + `profiles`.
- `getDashboardSummary(supabase, userId)` → [get-summary.ts:132-150](src/services/dashboard/get-summary.ts): `Promise.all` з 4 запитів — `menus` (count), `credits_balance`, `credits_transactions` (останні 5), `credits_transactions` (весь ledger).

**Головна сторінка** ([dashboard/page.tsx:77-93](<src/app/[locale]/(dashboard)/dashboard/page.tsx>)) — `Promise.all`:

- `menus` (список меню користувача, пагінація);
- `menu_templates` (усі шаблони — для стилів карток і слайдів каруселі);
- `assertMenuCreationEligible(user.id)` — перевірка ліміту (Supabase);
- `getDashboardSummary(...)` — ще раз (для рядка «N меню · вільних N»).

**Під-сторінки:** credits/history тягнуть `getDashboardSummary` + транзакції; profile — `getCurrentUser` (профіль). Усі — Supabase.

**Read-роут:** `GET /api/dashboard/summary` — той самий `getDashboardSummary` (у демо read-GET не-адмін лишений живим заслоном №1, але сторінки рендеряться SSR-викликом функції напряму, не через HTTP).

---

## 5. Кнопки важких дій — і чи вже заслонені

Усі важкі дії йдуть через API-роути (`lib/api-client/*`) → **заслон №1 `with-api-handler`** повертає 403 у демо. Косметично кнопки лишаються, але бекенд блокує.

| Кнопка / місце                                                                                                   | Викликає                                                                | Заслон DEMO_MODE                                  |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| «Нове меню» (сайдбар, промо, EmptyState)                                                                         | Link → `/menus/new` (навігація)                                         | сама навігація не важка; форма Import нижче — так |
| Import: submit ([import-form](src/components/menu-generator/import-form.tsx))                                    | `POST /api/menus/import` (аплоуд+AI)                                    | ✅ заслон №1 (tier `ai`, POST)                    |
| MenuCard → «Дублювати»                                                                                           | `menusApi.duplicate` → `POST /api/menus/[id]/duplicate`                 | ✅ заслон №1 (POST)                               |
| MenuCard → «Видалити»                                                                                            | `menusApi.remove` → `DELETE /api/menus/[id]`                            | ✅ заслон №1 (DELETE)                             |
| MenuCard → «Редагувати»                                                                                          | Link → `/menus/[id]/editor`                                             | навігація; дії в редакторі — нижче                |
| MenuCard → «Публічне посилання»                                                                                  | `a href /m/[slug]`                                                      | read-only (у демо /m показує приклад)             |
| Редактор: автозбереження ([use-menu-content-autosave](src/components/menu-editor/use-menu-content-autosave.ts))  | `PATCH /api/menus/[id]` / `.../style`                                   | ✅ заслон №1 (PATCH)                              |
| Редактор: «Перепідібрати фото» ([refresh-photos-section](src/components/menu-editor/refresh-photos-section.tsx)) | `POST /api/menus/[id]/photos/refresh`                                   | ✅ заслон №1 (tier `export`, POST)                |
| Редактор: пошук/заміна фото страви                                                                               | `POST .../items/[itemId]/photo(/search)`                                | ✅ заслон №1 (POST)                               |
| Експорт PDF/PNG/QR ([menu-export](src/components/menu-export))                                                   | `POST /api/menus/[id]/export/{pdf,png,qr}`                              | ✅ заслон №1 (tier `export`, POST)                |
| Confirm / Publish / Apply-template (майстер)                                                                     | відповідні `POST/PATCH` роути                                           | ✅ заслон №1                                      |
| Профіль: зміна пароля / аватар / видалення                                                                       | server action `changePasswordAction` / `POST avatar` / `DELETE profile` | ✅ заслон №2 (action) / №1 (роут)                 |

**Висновок по кнопках:** усі важкі точки вже заслонені раніше реалізованим DEMO_MODE. Нових заслонів для цього завдання не потрібно.

---

## 6. Редактор меню

**Окремий екран** (не частина дашборда): [src/app/[locale]/menus/[id]/editor/page.tsx](src/app/[locale]/menus/[id]/editor/page.tsx), крок майстра.

- **Відкривається** з MenuCard («Редагувати») або по завершенні майстра.
- **Гейт:** той самий `getCurrentUser()` → redirect /login (рядки 32-35).
- **Бере меню з БД:** `supabase.from("menus").select(...).eq("id", id).eq("user_id", user.id)` (рядки 38-43) + `menu_templates` для стилю. Редиректить на review/template, якщо меню не підтверджене/без шаблону.
- **UI:** `MenuStyleEditor` ([menu-style-editor.tsx](src/components/menu-editor/menu-style-editor.tsx)) — drag&drop, автозбереження, перепідбір фото, експорт.

> Редактор прив'язаний до `menu.id` у БД. Для демо його або лишають недоступним (кнопки заслонені, зберегти не можна), або підміняють джерело на демо-меню — але це складніше, ніж дашборд, бо весь редактор розрахований на реальний запис. Рекомендація в п.7.

---

## 7. Висновок — план для DEMO-вітрини (НЕ реалізовано)

Щоб у `DEMO_MODE` гість без входу побачив повноцінний дашборд із 3D-каруселлю на заготовлених даних, зберігаючи всі заслони:

**A. Пропустити гостя крізь три гейти автентифікації — синтетичний демо-користувач.**

1. **proxy.ts:** у гілці `isProtected && !user` додати `if (isDemoMode) не редиректити` — пустити запит на `/dashboard` далі.
2. **`getCurrentUser()`** ([get-current-user.ts](src/lib/auth/get-current-user.ts)): на початку `if (isDemoMode) return DEMO_USER;` — синтетичний профіль (fake id, ім'я, email, role:"user") БЕЗ звернення до `auth.getUser()`/`profiles`. Це одна точка, яку читають усі три гейти (layout, кожна page) — підміна тут покриває їх усі та прибирає прив'язку до Supabase Auth.
   - Наслідок: `user.role !== "admin"` → адмінка лишається недоступною (узгоджено з наявним заслоном №3в).

**B. Віддати дані дашборда з коду, без Supabase.** 3. **`getDashboardSummary`** ([get-summary.ts](src/services/dashboard/get-summary.ts)): `if (isDemoMode) return DEMO_SUMMARY;` — заготовлені числа (0 меню, вільне меню доступне) до будь-якого запиту. 4. **`dashboard/page.tsx`:** демо-гілка, що НЕ робить `Promise.all` до Supabase. Найпростіше рішення показу каруселі: віддати `items.length === 0` → рендериться EmptyState із `MenuPreviewShowcase`.

- Проблема: `previewSlides` зараз беруть стилі з `menu_templates` (БД). Для демо треба захардкодити 4 стилі (`resolveTemplateDefaults` з фіксованими `engine`, без запиту) — напр. винести дефолтні стилі рушіїв у константу поряд з `DEMO_PREVIEW_SLIDES`.
- `assertMenuCreationEligible` теж Supabase — у демо повернути `true`/`false` без запиту (краще `false`, щоб приховати кнопку «Створити», бо створення заслонене).

**C. Карусель уже готова** — `menu-preview-carousel.tsx` даних із БД не потребує (контент — RSC із `DEMO_MENU_PREVIEW`). Змін не треба, щойно сторінка дійде до EmptyState-гілки без падіння на Supabase.

**D. Важкі кнопки — нічого не робити.** Усі вже заслонені (розділ 5). Косметично можна лишити видимими для демонстрації, або приховати; заслон на бекенді від цього не залежить.

**E. Під-сторінки credits/history/profile та редактор.** Варіанти:

- Мінімальний демо: лишити лише `/dashboard` (карусель), а credits/history/profile/editor — або підмінити `getDashboardSummary`/`getCurrentUser` (вже покриває більшість), або тимчасово ховати пункти навігації в демо.
- Редактор `/menus/[id]/editor` прив'язаний до реального запису — у демо простіше не вести на нього (кнопки заслонені; пряме відкриття дасть Supabase-запит з фейковим user.id → порожньо → notFound). За потреби демонстрації редактора — окрема задача з підміною джерела меню.

**Ключові точки підміни (мінімальний набір, усе під `if (isDemoMode)`):**

- `src/proxy.ts` — не редиректити protected у демо.
- `src/lib/auth/get-current-user.ts` — синтетичний `DEMO_USER`.
- `src/services/dashboard/get-summary.ts` — `DEMO_SUMMARY`.
- `src/app/[locale]/(dashboard)/dashboard/page.tsx` — демо-гілка без Supabase + хардкод стилів каруселі.

**Гарантії:** жоден реальний API/база не смикається (усі demo-гілки повертають до `createClient()`); зовнішні домени не залучені (фото локальні); важкі дії лишаються заблокованими наявними заслонами; при `DEMO_MODE=false` усе працює як раніше.

---

_Кінець карти. Тільки читання — у проєкті нічого не змінено._
