import { RootShell } from "@/app/root-shell";

/**
 * The public menu page (`/m/[slug]`) deliberately stays outside the
 * `[locale]` segment and unlocalized (Stage 12 report covers the full
 * reasoning): a menu's *content* language is the restaurant's own choice,
 * fixed per-menu (`menus.locale`, set when it's created), not the SaaS
 * interface language — and the URL itself is a permanent, externally
 * shared artifact (QR codes, printed materials) that must not shift when
 * this app's interface locale set changes. `lang="en"` here is a
 * reasonable structural default for the shell; it doesn't claim to match
 * any specific menu's content language.
 */
export default function PublicMenuLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
