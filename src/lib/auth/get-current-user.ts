import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type CurrentUser = Tables<"profiles">;

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return profile;
});
