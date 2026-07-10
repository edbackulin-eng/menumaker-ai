import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

/**
 * Self-hosted at build time by next/font (no runtime requests to Google
 * Fonts — good for perf and EU/GDPR compliance). Inter covers Latin +
 * Cyrillic, enough for the current en/uk locales. It doesn't have an Arabic
 * cut; when RTL/Arabic support lands, pair it with a matching Arabic
 * typeface (e.g. IBM Plex Sans Arabic) behind a locale-driven `font-arabic`
 * variable rather than replacing Inter outright.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MenuMaker AI",
  description: "Автоматичне створення професійних меню для ресторанів, кафе та барів.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
