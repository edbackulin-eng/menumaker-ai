"use client";

import * as React from "react";

import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export interface GoogleSignInButtonProps {
  label: string;
}

/**
 * Runs client-side (not a Server Action): signInWithOAuth needs to redirect
 * the *browser* to Google's consent screen, which is a full navigation, not
 * something a server round-trip is needed for. No Turnstile here — Google
 * itself is the anti-bot control for this path.
 */
export function GoogleSignInButton({ label }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) {
      setIsLoading(false);
    }
    // On success the browser navigates away to Google; nothing left to do.
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      isLoading={isLoading}
      onClick={handleClick}
    >
      {!isLoading && <GoogleIcon className="size-4" />}
      {label}
    </Button>
  );
}
