import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { publicEnv } from "@/config/env";

/**
 * Supabase-клієнт для Server Components, Server Actions та Route Handlers.
 * `cookies()` у Next.js App Router є асинхронною функцією, тому і цей клієнт
 * створюється асинхронно: `const supabase = await createClient();`
 *
 * `setAll` може кинути помилку, якщо викликається під час рендеру Server
 * Component (де запис кук заборонено) — це очікувано і безпечно ігнорується,
 * якщо сесія оновлюється окремим механізмом (proxy/middleware) на етапі Auth.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Викликано зі Server Component під час рендеру — ігноруємо.
          }
        },
      },
    },
  );
}
