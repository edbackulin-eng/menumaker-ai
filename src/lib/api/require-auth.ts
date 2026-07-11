import "server-only";
import type { User } from "@supabase/supabase-js";

import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

/**
 * Second layer of defense on top of RLS (Stage 2): RLS makes other users'
 * rows physically unreachable even if this check were skipped, but without
 * it a Route Handler would just silently return empty results instead of a
 * clear 401 — this makes the failure explicit.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return { user, supabase };
}

export async function requireAdmin(): Promise<{
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  const { user, supabase } = await requireAuth();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new ForbiddenError();
  }

  return { user, supabase };
}
