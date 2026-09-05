# MenuMaker AI — повна інвентаризація проєкту

> Згенеровано: 2026-08-21. Нічого в проєкті не змінено — це лише звіт для довідки.

---

## 1. Розташування

`C:\Users\PC\OneDrive\Документи\GitHub\menumaker-ai`

---

## 2. Технологічний стек

- **Мова:** TypeScript (strict, `noUncheckedIndexedAccess`)
- **Фреймворк:** Next.js 16.2.10 (App Router, Server Components, Turbopack), React 19.2.4
- **Стилі:** Tailwind CSS v4
- **БД/Auth/Storage:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **AI:** `@anthropic-ai/sdk` — Claude Haiku 4.5, через власний provider-factory
- **Фото:** Pexels API
- **CAPTCHA:** Cloudflare Turnstile
- **Експорт:** `@react-pdf/renderer` (PDF), `sharp` (PNG/зображення), `exceljs`, `qrcode`
- **Парсинг файлів:** `mammoth` (docx), `unpdf` (PDF)
- **i18n:** `next-intl` (5 локалей: uk, en, es, de, pl)
- **Форми:** `react-hook-form` + `zod` + `@hookform/resolvers`
- **UI:** Radix UI примітиви, `lucide-react`, `@dnd-kit` (drag&drop), `recharts`
- **Логи:** `pino`/`pino-pretty`
- **Пакетний менеджер:** npm (є `package-lock.json`)
- **Лінт/формат:** ESLint 9, Prettier + `prettier-plugin-tailwindcss`, Husky + lint-staged (pre-commit хук)
- **Платежі:** Stripe — код готовий, але **призупинено** й лежить в окремій гілці `stage-9-stripe-payments-paused`, не в `main`

---

## 3. Структура каталогів (до 3 рівнів, без node_modules/.next/dist)

```
menumaker-ai/
├── .claude/                launch.json, settings.local.json
├── .husky/                 pre-commit хук
├── docs/                   ai-service, anthropic-setup, api-conventions,
│                            auth-provider-setup, deploy-vercel, menu-editor,
│                            menu-export, menu-generator, menu-templates-design,
│                            payments-integration, privacy-audit, project-state
├── messages/                de/en/es/pl/uk.json (i18n-рядки інтерфейсу)
├── public/demo-menu/       демо-фото для EmptyState-каруселі
├── src/
│   ├── app/                App Router
│   │   ├── (auth)/, [locale]/, admin/, api/, auth/, design-system/, m/
│   │   ├── robots.ts, sitemap.ts, root-shell.tsx
│   ├── assets/fonts/
│   ├── components/         admin, auth, dashboard, legal, menu-editor,
│   │                        menu-export, menu-generator, menu-render, seo,
│   │                        shared, ui
│   ├── config/              env.ts, env.server.ts, env.ai.ts, env.photos.ts,
│   │                        geo-block.ts, auth.ts, menu-style.ts,
│   │                        business-type.ts, reserved-slugs.ts, seo.ts, ...
│   ├── content/legal/       types.ts, index.ts, de/en/es/pl/uk.ts
│   ├── features/            admin, ai, auth, credits, menu, profile
│   ├── i18n/                navigation.ts, request.ts, routing.ts
│   ├── lib/                 api, api-client, auth, constants, dnd, errors,
│   │                        export, fonts, seo, supabase, turnstile, utils,
│   │                        validations, logger.ts
│   ├── proxy.ts             middleware: locale + гео-блок + rate limit
│   ├── services/            admin, ai, dashboard, export, file-parser,
│   │                        menu-generator, photos
│   ├── styles/globals.css
│   └── types/database.types.ts
├── supabase/                config.toml, migrations/ (27 файлів), seed.sql, tests/
├── AGENTS.md, CLAUDE.md, CONTRIBUTING.md, README.md
├── .env.example, .env.local
└── next.config.ts, tailwind.config.ts, tsconfig.json, eslint.config.mjs
```

---

## 4. Точка входу і запуск

- Dev-сервер: `npm run dev` → `next dev`, доступний на `http://localhost:3000`
- Build: `npm run build` → `next build`
- Продакшн-запуск: `npm run start`
- Інші скрипти: `lint`, `format`, `format:check`, `type-check`, `prepare` (husky)
- Головна сторінка обслуговується напряму з `src/app/page.tsx` (структура `app/[locale]/` під i18n зарезервована, але поки що порожня для лендінгу)
- Розгортання: Vercel, підключено через GitHub (`edbackulin-eng/menumaker-ai`)

---

## 5. Git

- Гілка: `main`
- Статус: чисто, незакомічених змін немає
- Останні 10 комітів:
  1. `7ce6f40` Stage 15.6 GDPR: гео-блок ЄС/UK, /privacy /terms, згода на OAuth і email-реєстрації
  2. `9dd8f82` Додано docs/project-state.md
  3. `c59ac40` Підготовка до деплою: maxDuration, .env.example, документація
  4. `a386b5e` Карусель: адаптивна ширина сцени + фікс паузи на hover
  5. `a0dec15` SEO: robots.txt, sitemap.xml, hreflang, Schema.org, noindex
  6. `b7089e8` EmptyState: каруселька превʼю з автопрогортуванням
  7. `a3098ca` Перемикач «меню без фото»
  8. `8af0ffa` Етап 3: styleSuffix на тип закладу + перепідбір фото
  9. `e27a39b` Етап 3: вкладки типів закладу + форма venue
  10. `280a88f` Етап 3: рушій Editorial + 2 пресети

---

## 6. Призначення проєкту

SaaS-конструктор меню для ресторанів, кафе, барів і пекарень. Користувач завантажує/вводить меню (текст, PDF, docx), AI (Claude Haiku 4.5) розпізнає й структурує страви, підбираються фото страв через Pexels, обирається один із 4 дизайн-рушіїв (Modern/Grid/Bistro/Editorial), результат публікується як публічна сторінка `/m/[slug]` (з QR-кодом для столиків) і експортується в PDF/PNG. Є кредитна система лімітів, адмін-панель, dashboard користувача. Монетизація (Stripe) навмисно призупинена через юридичні обмеження для України та відсутність перевіреного попиту.

---

## 7. Юридичні файли та все, що стосується GDPR/приватності

| Файл                                                                                  | Призначення                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/config/geo-block.ts`                                                             | Список країн ЄС/UK/ЄЕЗ/Швейцарії, функція `isBlockedCountry`                                                                                                                                          |
| `src/proxy.ts`                                                                        | `GEOBLOCKED_PREFIXES` — блокує `/login`, `/register`, `/forgot-password`, `/reset-password`, `/oauth-consent` для цих країн                                                                           |
| `src/content/legal/types.ts`, `index.ts`, `de.ts`, `en.ts`, `es.ts`, `pl.ts`, `uk.ts` | Тексти Privacy Policy / Terms на 5 мовах (по 188 рядків кожен) — **містять незаповнені плейсхолдери** `[CONTROLLER_NAME]`, `[JURISDICTION]`, `[PRIVACY_EMAIL]`, `[ABUSE_EMAIL]` (65 входжень сукупно) |
| `src/components/legal/legal-document.tsx`                                             | Рендер-компонент юридичних сторінок                                                                                                                                                                   |
| `src/app/[locale]/oauth-consent/page.tsx`                                             | Екран згоди перед Google OAuth                                                                                                                                                                        |
| `supabase/migrations/20260727100000_profiles_terms_accepted_at.sql`                   | Колонка `profiles.terms_accepted_at`, захищена тригером від запису самим користувачем                                                                                                                 |
| `docs/privacy-audit.md`                                                               | Юридичний аудит (risk register)                                                                                                                                                                       |
| `docs/project-state.md`                                                               | Детальний розділ про GDPR-рішення, атрибуцію Pexels, TTL, storage-видалення тощо                                                                                                                      |

**Публічний ліцензійний файл (LICENSE) у корені проєкту відсутній** — знайдено лише LICENSE-файли всередині `node_modules`.

Ключові юридичні рішення з коду/докс: вік 18+ вимагається текстом політики; резиденти ЄС/UK/ЄЕЗ/Швейцарії технічно заблоковані на `/login`, `/register` та відновлення пароля (гео-IP через `x-vercel-ip-country`); публічні сторінки меню `/m/[slug]` не блокуються; є явна форма/email для «Report content» (notice & takedown) — email підставляється через плейсхолдер `[ABUSE_EMAIL]`.

---

## 8. Збір/зберігання/передача даних користувача

**Форми:**

- Реєстрація/логін email + Google OAuth (`src/features/auth`)
- Форма venue (адреса, телефон закладу)
- Форма редагування меню (drag&drop через `@dnd-kit`)
- Завантаження аватара, завантаження файлу меню (docx/PDF) для парсингу

**Cookies:**

- Supabase session cookie — `httpOnly: false` (свідомо, для клієнтського `useUser()`-хука), `maxAge` через `SESSION_COOKIE_MAX_AGE_SECONDS` (config: `src/config/auth.ts`), застосовується однаково у `src/lib/supabase/client.ts`, `server.ts` і `src/proxy.ts`
- Cloudflare Turnstile — можливо ставить власні куки на CAPTCHA-запиті (за `project-state.md` — **не перевірено фактично**, відкрите питання)

**localStorage/sessionStorage:** не використовується в `src` (грепом не знайдено).

**Аналітика/трекери:** не знайдено (жодних Google Analytics, gtag, Mixpanel, Sentry, PostHog, Hotjar тощо в `src`).

**Зовнішні API-виклики (сервер-сайд, у `src/services`):**

- `services/ai/providers/anthropic-provider.ts` — Anthropic API (текст меню передається на аналіз; `project-state.md` фіксує, що `venue.address`/`venue.phone` **виключено** з AI-payload)
- `services/photos/providers/pexels-provider.ts` — Pexels API (пошук/завантаження фото страв)
- Supabase — Database, Auth, Storage (4 бакети: `avatars`, `menu-uploads`, `menu-exports`, `menu-photos`)
- Turnstile siteverify — серверна перевірка CAPTCHA-токена (`src/lib/turnstile`)

**Storage-видалення:** за `project-state.md` реалізовано видалення файлів з усіх 4 бакетів при видаленні акаунту (виправлення критичного розриву ст. 17 GDPR).

**Платіжна інтеграція:** Stripe-код існує (`docs/payments-integration.md`), але не змерджений в `main`, платежі вимкнено.

---

## 9. Зовнішні залежності та сервіси

- **Anthropic** (Claude Haiku 4.5) — AI-аналіз/генерація меню
- **Pexels API** — фото страв
- **Supabase** (Frankfurt, EU) — БД, Auth, Storage
- **Cloudflare Turnstile** — CAPTCHA на реєстрації
- **Google OAuth** — вхід/реєстрація
- **Vercel** — хостинг/деплой
- Шрифти — власні файли в `src/assets/fonts` (не Google Fonts CDN, судячи зі структури)
- Google Fonts/CDN — не знайдено підключень у коді

---

## 10. Незавершене / TODO / заглушки

- **TODO/FIXME/XXX/HACK у `src`:** жодного знайдено (0 збігів) — репозиторій тримають чистим від маркерів
- **`app/[locale]/` порожній навмисно** — заготовка під майбутню i18n-маршрутизацію лендінгу, задокументовано в README
- **Плейсхолдери в юридичних текстах** (`[CONTROLLER_NAME]`, `[JURISDICTION]`, `[PRIVACY_EMAIL]`, `[ABUSE_EMAIL]`) — 65 входжень, очікують підстановки реальних значень від Product Owner
- **Відкриті питання з `docs/project-state.md`:**
  - Домен ще не куплено (все на `*.vercel.app`), через що SMTP і відновлення пароля для email-акаунтів не працюють — Google OAuth головний шлях входу
  - Не перевірено фактично, чи ставить Cloudflare Turnstile власні куки
  - Не перевірено чинний статус EU-US Data Privacy Framework для Anthropic/Vercel/Cloudflare
  - Автоматичний експорт даних користувача (ст. 20 GDPR) не реалізований — обробка вручну через email
  - Реєстрація ФОП потрібна до будь-якої монетизації — платежі лишаються вимкненими
  - Відомий баг: помилки авторизації (`src/features/auth/actions.ts`, `src/lib/validations/auth.ts`) хардкоджені українською, не проходять через `next-intl`
  - Відомий баг: Cloudflare Turnstile-віджет завжди українською (не прокидається `language`-проп)
  - `terms_accepted_at` порожній для всіх акаунтів, створених до 28.07.2026 (свідомо, заднім числом не проставляється); міграція ще **не запушена** на реальний Supabase-проєкт
- **`.env.local` існує в корені** (реальні секрети) — вміст не читався, лише підтверджена наявність файлу поруч із `.env.example`

---

_Кінець звіту. Нічого в проєкті не змінено і не встановлено._
