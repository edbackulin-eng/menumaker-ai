import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/config/env";
import type { Database } from "@/types/database.types";

/**
 * Supabase-клієнт для використання в браузері (Client Components).
 * Використовує лише публічні (anon) ключі — безпечний для клієнтського бандла.
 */
export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
