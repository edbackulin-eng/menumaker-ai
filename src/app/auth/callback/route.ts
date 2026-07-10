import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges the PKCE `code` param for a session — used by both Google OAuth
 * and password-recovery email links (see resetPasswordRequestAction, which
 * points its redirectTo here with `next=/reset-password`).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  // Only allow relative, same-origin paths — `next` is attacker-influenceable
  // (it's a query param), so this guards against an open-redirect via e.g.
  // `next=//evil.example.com`.
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
