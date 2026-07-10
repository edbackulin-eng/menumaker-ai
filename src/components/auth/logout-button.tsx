"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";

export function LogoutButton({ variant = "ghost", ...props }: Partial<ButtonProps>) {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      isLoading={isLoading}
      onClick={() => {
        setIsLoading(true);
        void signOutAction();
      }}
      {...props}
    >
      Вийти
    </Button>
  );
}
