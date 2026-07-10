import type { Metadata } from "next";

// Defense-in-depth alongside the notFound() gate in page.tsx: even if this
// route is somehow reachable, it's never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
