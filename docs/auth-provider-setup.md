# Налаштування Google OAuth та Cloudflare Turnstile

Дії, які може виконати лише Product Owner (доступ до Google Cloud Console і Cloudflare — сторонні акаунти, я до них доступу не маю). Все інше (Supabase Dashboard: вимкнення підтвердження email, redirect URLs, мінімальна довжина пароля) уже застосовано мною через `supabase config push`.

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

### 1.3. Перевірка

Відкрийте `/register` або `/login` на застосунку, натисніть кнопку "через Google" — має відкритись Google consent screen і повернути на `/dashboard`.

## 2. Cloudflare Turnstile

Наразі в `.env.local` стоять **офіційні тестові ключі Cloudflare** (`1x00000000000000000000AA` / `1x0000...AA`), які завжди проходять перевірку — реєстрація вже працює, але це не справжній захист від ботів.

1. Зареєструйтесь на [dash.cloudflare.com](https://dash.cloudflare.com) (безкоштовно, картка не потрібна).
2. **Turnstile** (ліва панель) → **Add site**:
   - Site name: `MenuMaker AI`.
   - Domain: `localhost` для розробки; додайте продакшн-домен пізніше (можна додати кілька доменів одразу).
   - Widget mode: **Managed** (рекомендовано — Cloudflare сам вирішує, чи показувати виклик користувачу).
3. Скопіюйте **Site Key** (публічний) та **Secret Key** (приватний).
4. Замініть у `.env.local` (і пізніше — у змінних середовища Vercel для продакшену):
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=<ваш site key>
   TURNSTILE_SECRET_KEY=<ваш secret key>
   ```
5. Перезапустіть `npm run dev`.

### Перевірка

На `/register` віджет Turnstile має відображатись і автоматично (або після короткого виклику) підтверджувати проходження.

## 3. Що вже зроблено мною (Supabase Dashboard/config)

Застосовано через `supabase config push` після вашого підтвердження:

- Підтвердження email при реєстрації — **вимкнено** (`enable_confirmations = false`).
- `site_url` → `http://localhost:3000`, redirect URLs → `http://localhost:3000/**`.
- `minimum_password_length` → 8.

**Побічний ефект**, про який варто знати: пуш конфігурації також вимкнув `mfa.totp.enroll_enabled`/`verify_enabled` (був `true` на проєкті, у локальному `config.toml` — `false` за замовчуванням, оскільки MFA цим етапом не займались). Якщо TOTP-MFA потрібен — увімкніть вручну в Dashboard → Authentication → Multi-Factor Authentication.

## 4. Чек-лист перед продакшеном

- [ ] Додати продакшн-домен у `supabase/config.toml` (`additional_redirect_urls`) і запустити `supabase config push` ще раз.
- [ ] Додати продакшн-домен як Authorized JavaScript origin у Google Cloud Console (redirect URI лишається той самий — це домен Supabase).
- [ ] Додати продакшн-домен у список дозволених доменів Turnstile.
- [ ] Виставити `NEXT_PUBLIC_APP_URL` на реальний продакшн-URL у змінних середовища Vercel.
- [ ] **Підключити власний SMTP** для auth-листів (Settings → Auth → SMTP Settings). Вбудований email-сервіс Supabase має дуже суворий ліміт — я впіймав `over_email_send_rate_limit` уже після ~3 листів під час тестування. Для реальних користувачів (лист скидання пароля тощо) це неприйнятно без власного SMTP (Resend, SendGrid тощо).
