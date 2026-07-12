import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

/**
 * Self-hosted at build time by next/font (no runtime requests to Google
 * Fonts — good for perf and EU/GDPR compliance). Inter covers Latin +
 * Cyrillic, enough for the current locale set. It doesn't have an Arabic
 * cut; when RTL/Arabic support lands, pair it with a matching Arabic
 * typeface (e.g. IBM Plex Sans Arabic) behind a locale-driven `font-arabic`
 * variable rather than replacing Inter outright.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

/**
 * The `<html>`/`<body>` shell, shared by every top-level root layout
 * (`[locale]`, `admin`, `design-system`, `m`). Next.js only allows the
 * outermost layout on a given route to render `<html>`/`<body>` — since
 * `/admin` and `/design-system` intentionally live outside the `[locale]`
 * segment (see Stage 12 report), there is no single shared root layout
 * anymore, so each top-level segment owns one and they all render this.
 */
export function RootShell({
  lang,
  dir = "ltr",
  children,
}: {
  lang: string;
  dir?: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} dir={dir} className={`${inter.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
