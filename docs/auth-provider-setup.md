# Налаштування Google OAuth та Cloudflare Turnstile

## Статус: обидва провайдери підключені та перевірені ✅

| Провайдер            | Статус                                                                      | Перевірено                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google OAuth         | Увімкнено в Supabase (Client ID + Secret додано, callback URL підтверджено) | Автоматизований запит на `/login` коректно доходить до реального `accounts.google.com` (не сторінка помилки), з правильними `client_id`, `redirect_uri=https://vjwjdgdmwtpbyhowazpa.supabase.co/auth/v1/callback`, `response_type=code`. Повний вхід (введення реальних Google-даних) не автоматизовував — я не вводжу паролі в жодні форми навіть за наявності доступу.                                                                                                                    |
| Cloudflare Turnstile | Реальні ключі в `.env.local` (Managed mode, hostname `localhost`)           | Віджет рендериться коректно на `/register` (реальний чекбокс "Verify you are human", не invisible test-ключ). Клієнтська валідація коректно блокує сабміт без розв'язаного виклику. Серверна перевірка (`siteverify` з реальним secret key) коректно повертає `success: false` на підроблені/порожні токени. Повний "успішний" шлях (`success: true` на справжньому, розв'язаному токені) вже підтверджено раніше на офіційних тестових ключах Cloudflare — той самий код, лише інший ключ. |

Нижче — інструкції, якими користувались для початкового налаштування (лишаю для довідки: знадобляться, якщо створюватимете новий Google Cloud / Cloudflare проєкт для staging-середовища тощо).

## 1. Google OAuth

### 1.1. Google Cloud Console

1. Відкрийте [console.cloud.google.com](https://console.cloud.google.com), створіть новий проєкт (або оберіть існуючий) — наприклад "MenuMaker AI".
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - App name: `MenuMaker AI`, підтримка/контактний email — ваш.
   - Scopes: залиште дефолтні (`email`, `profile`, `openid`) — додаткові не потрібні.
   - Поки не опублікуєте consent screen, Google показуватиме попередження "unverified app" тестовим користувачам — додайте свій email у Test users для перевірки, або опублікуйте (Publish App) для базових scope це не вимагає ревью Google.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Name: `MenuMaker AI Web`.
   - Authorized JavaScript origins: `http://localhost:3000` (пізніше додасте продакшн-домен).
   - Authorized redirect URIs — **це URL Supabase, не наш застосунок**:
     ```
     https://vjwjdgdmwtpbyhowazpa.supabase.co/auth/v1/callback
     ```
     Цей URL не міняється при переході в продакшн (він завжди належить Supabase).
4. Після створення скопіюйте **Client ID** та **Client Secret**.

### 1.2. Supabase Dashboard

1. [Dashboard проєкту](https://supabase.com/dashboard/project/vjwjdgdmwtpbyhowazpa) → **Authentication → Providers → Google**.
2. Увімкніть тумблер, вставте Client ID та Client Secret з кроку 1.1.
3. Save.

### 1.3. Фінальна ручна перевірка (залишається на вас)

Відкрийте `/login`, натисніть "Увійти через Google", завершіть вхід власним акаунтом — має повернути на `/dashboard`. Після цього можу перевірити в БД, що для вашого акаунту створився `profiles`+`credits_balance` запис.

## 2. Cloudflare Turnstile

Реальні ключі вже в `.env.local` (Managed mode, hostname `localhost`).

1. Зареєструйтесь на [dash.cloudflare.com](https://dash.cloudflare.com) (безкоштовно, картка не потрібна).
2. **Turnstile** (ліва панель) → **Add site**:
   - Site name: `MenuMaker AI`.
   - Domain: `localhost` для розробки; додайте продакшн-домен пізніше (можна додати кілька доменів одразу).
   - Widget mode: **Managed** (рекомендовано — Cloudflare сам вирішує, чи показувати виклик користувачу).
3. Скопіюйте **Site Key** (публічний) та **Secret Key** (приватний), додайте в `.env.local`.

## 3. Що вже зроблено мною (Supabase Dashboard/config)

Застосовано через `supabase config push` після вашого підтвердження:

- Підтвердження email при реєстрації — **вимкнено** (`enable_confirmations = false`).
- `site_url` → `http://localhost:3000`, redirect URLs → `http://localhost:3000/**`.
- `minimum_password_length` → 8.

**Побічний ефект**, про який варто знати: пуш конфігурації також вимкнув `mfa.totp.enroll_enabled`/`verify_enabled` (був `true` на проєкті, у локальному `config.toml` — `false` за замовчуванням, оскільки MFA цим етапом не займались). Якщо TOTP-MFA потрібен — увімкніть вручну в Dashboard → Authentication → Multi-Factor Authentication.

## 4. Чек-лист перед продакшеном

- [ ] Додати продакшн-домен у `supabase/config.toml` (`additional_redirect_urls`) і запустити `supabase config push` ще раз.
- [ ] Додати продакшн-домен як Authorized JavaScript origin у Google Cloud Console (redirect URI лишається той самий — це домен Supabase).
- [ ] Додати продакшн-домен у список дозволених доменів Turnstile (зараз лише `localhost`).
- [ ] Виставити `NEXT_PUBLIC_APP_URL` на реальний продакшн-URL, і реальні `NEXT_PUBLIC_TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY` — у змінних середовища Vercel (не лише `.env.local`).
- [ ] Опублікувати Google OAuth consent screen (зараз, ймовірно, у режимі Testing — production-користувачі поза Test users побачать "unverified app").
- [ ] **Підключити власний SMTP** для auth-листів (Settings → Auth → SMTP Settings). Вбудований email-сервіс Supabase має дуже суворий ліміт — я впіймав `over_email_send_rate_limit` уже після ~3 листів під час тестування. Для реальних користувачів (лист скидання пароля тощо) це неприйнятно без власного SMTP (Resend, SendGrid тощо).
