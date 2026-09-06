import "server-only";

import { cache } from "react";

import { isDemoMode } from "@/config/demo";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type CurrentUser = Tables<"profiles">;

/**
 * Synthetic guest for DEMO_MODE. Returned instead of ever calling Supabase
 * Auth/`profiles`, so the demo dashboard has a "signed-in" user with no
 * database at all. `role: "user"` (never "admin") keeps the admin panel
 * closed — `admin/layout.tsx` re-checks `role !== "admin"` and its own
 * DEMO_MODE redirect stays in force regardless.
 */
const DEMO_USER: CurrentUser = {
  id: "demo-guest",
  email: "guest@demo.local",
  full_name: "Demo Guest",
  avatar_url: null,
  locale: "en",
  role: "user",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  subscription_expires_at: null,
  subscription_status: null,
  subscription_tier: null,
  terms_accepted_at: "2024-01-01T00:00:00.000Z",
};

/**
 * For Server Components — returns the signed-in user's profile row, or null.
 *
 * `cache()`-wrapped: every protected route calls this from both its layout
 * and its page (each independently re-verifying auth, by design — see the
 * "proxy is a fast redirect, the page/layout is the real gate" comment used
 * throughout this codebase since Stage 4). Without memoization, that means
 * 2+ full `auth.getUser()` round-trips to Supabase Auth plus 2+ `profiles`
 * SELECTs for a *single* page render. `cache()` de-dupes calls with the
 * same (no) arguments within one request, so every caller on the same
 * request shares one real network round-trip instead of paying for their
 * own — same defense-in-depth guarantee, one fetch.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Demo: no Supabase Auth round-trip, no `profiles` SELECT. This single
  // point is read by proxy's page/layout gates, so returning the guest here
  // unlocks the whole dashboard for a visitor with no session.
  if (isDemoMode) return DEMO_USER;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return profile;
});
