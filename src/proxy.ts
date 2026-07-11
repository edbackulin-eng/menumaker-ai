import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicEnv } from "@/config/env";
import type { Database } from "@/types/database.types";

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/menus"];
const ADMIN_PREFIX = "/admin";

/**
 * Next.js 16 renamed middleware.ts -> proxy.ts (same mechanism, nodejs-only
 * runtime). Runs on nearly every request (see matcher below) to keep the
 * Supabase session cookie fresh — Supabase's own guidance for App Router.
 *
 * The /admin role check here is an *optimistic* check for a fast redirect;
 * Next's own docs say proxy "should not be used as a full session
 * management or authorization solution" for exactly this kind of DB-backed
 * check, so the /admin page itself re-verifies role server-side too
 * (defense in depth, not just relying on this file).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser(), not getSession(): this revalidates the token against
  // Supabase (and rotates/refreshes it via the cookie callbacks above)
  // instead of trusting a potentially stale cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith(ADMIN_PREFIX) && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets / image optimization / favicon, so
    // the session stays fresh app-wide, not just on protected routes.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
