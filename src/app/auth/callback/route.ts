import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Only Google sign-ins go through this stamp — password-recovery links
      // land here too (see the doc comment above) but never through
      // /oauth-consent, so they must never be treated as "consent just
      // given". `terms_accepted_at` is set only if still unset: a returning
      // Google user re-authenticates through /oauth-consent on every login
      // (see google-signin-button.tsx — there is no way to reach Google
      // without it), but the *database* record of their original consent
      // date must never be overwritten by a later login.
      if (data.user?.app_metadata.provider === "google") {
        const admin = createServiceClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("terms_accepted_at")
          .eq("id", data.user.id)
          .single();
        if (profile && !profile.terms_accepted_at) {
          await admin
            .from("profiles")
            .update({ terms_accepted_at: new Date().toISOString() })
            .eq("id", data.user.id);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
