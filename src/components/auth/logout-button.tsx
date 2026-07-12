"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";

export function LogoutButton({ variant = "ghost", ...props }: Partial<ButtonProps>) {
  const t = useTranslations("auth");
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
      {t("logout")}
    </Button>
  );
}
