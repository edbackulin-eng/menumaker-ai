"use client";

import type { User } from "@supabase/supabase-js";
import * as React from "react";

import { createClient } from "@/lib/supabase/client";

export interface UseUserResult {
  user: User | null;
  isLoading: boolean;
}

/** For Client Components — subscribes to auth state changes. */
export function useUser(): UseUserResult {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading };
}
