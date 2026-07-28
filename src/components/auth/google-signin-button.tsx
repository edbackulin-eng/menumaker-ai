import { GoogleIcon } from "@/components/auth/google-icon";
import { buttonVariants } from "@/components/ui/button-variants";
import { Link } from "@/i18n/navigation";

export interface GoogleSignInButtonProps {
  label: string;
}

/**
 * A plain link styled as a button, not a client component that calls
 * `signInWithOAuth` directly — that used to happen here, but it let a
 * visitor reach Google's consent screen (and, on return, a live Supabase
 * session) without ever seeing our own Privacy Policy/Terms consent
 * checkbox. Every "continue with Google" click now goes through
 * `/oauth-consent` first, which is the only place that actually calls
 * `signInWithOAuth` (see oauth-consent-form.tsx) — and only once that
 * checkbox is ticked.
 */
export function GoogleSignInButton({ label }: GoogleSignInButtonProps) {
  return (
    <Link
      href="/oauth-consent?provider=google"
      className={buttonVariants({ variant: "secondary", className: "w-full" })}
    >
      <GoogleIcon className="size-4" />
      {label}
    </Link>
  );
}
