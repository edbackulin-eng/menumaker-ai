import { createNavigation } from "next-intl/navigation";

import { routing } from "@/i18n/routing";

/**
 * Locale-aware Link/redirect/router — every in-app navigation under
 * `[locale]` must go through these, not raw `next/link`/`next/navigation`,
 * or the locale prefix silently drops on click (see Stage 12 report).
 * `/admin`, `/api/**`, `/auth/callback` and `/design-system` live outside
 * the locale segment and keep using `next/link` directly.
 */
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
