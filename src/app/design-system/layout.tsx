import type { Metadata } from "next";

import { SITE_URL } from "@/config/seo";
import { RootShell } from "@/app/root-shell";

// Defense-in-depth alongside the notFound() gate in page.tsx: even if this
// route is somehow reachable, it's never indexed.
export const metadata: Metadata = {
  metadataBase: SITE_URL,
  robots: { index: false, follow: false },
};

/**
 * Dev-only demo page, deliberately kept outside the `[locale]` segment —
 * an internal tool, not user-facing content the i18n legal requirement
 * applies to (same reasoning as `/admin`). Now a top-level root layout in
 * its own right; see Stage 12 report.
 */
export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
