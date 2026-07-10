import "server-only";
import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/config/env";
import { serverEnv } from "@/config/env.server";
import type { Database } from "@/types/database.types";

/**
 * Service-role client — bypasses RLS entirely. Never import this outside
 * trusted server-only code (Server Actions, Route Handlers). Not
 * session-aware (no cookies): only for backend bookkeeping like the login
 * rate limiter, not for acting "as" a signed-in user.
 */
export function createServiceClient() {
  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
