import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;
const LOCKOUT_SECONDS = 15 * 60;

function loginKey(email: string) {
  return `login:${email.trim().toLowerCase()}`;
}

export interface LoginLockStatus {
  locked: boolean;
  retryAfterSeconds: number;
}

/**
 * Postgres-backed (not in-memory) so the lock is consistent across multiple
 * server instances. Call before attempting supabase.auth.signInWithPassword.
 */
export async function checkLoginLock(email: string): Promise<LoginLockStatus> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("is_login_locked", { p_key: loginKey(email) });

  if (error) {
    // Fail open on infra errors — a broken rate limiter must not itself
    // become a way to lock every user out of the app.
    console.error("checkLoginLock failed:", error);
    return { locked: false, retryAfterSeconds: 0 };
  }

  const row = data?.[0];
  if (!row) return { locked: false, retryAfterSeconds: 0 };
  return { locked: row.locked, retryAfterSeconds: row.retry_after_seconds ?? 0 };
}

/** Call after a failed signInWithPassword. */
export async function recordLoginFailure(email: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.rpc("record_login_failure", {
    p_key: loginKey(email),
    p_max_attempts: MAX_ATTEMPTS,
    p_window_seconds: WINDOW_SECONDS,
    p_lockout_seconds: LOCKOUT_SECONDS,
  });
  if (error) console.error("recordLoginFailure failed:", error);
}

/** Call after a successful signInWithPassword — clears the counter. */
export async function recordLoginSuccess(email: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.rpc("record_login_success", { p_key: loginKey(email) });
  if (error) console.error("recordLoginSuccess failed:", error);
}
