"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  /** Full name used to derive initials when there's no image (or it fails to load). */
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "size-8 text-caption",
  md: "size-10 text-body-sm",
  lg: "size-14 text-body-lg",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "bg-accent-50 relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        sizeClasses[size],
        className,
      )}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt ?? name ?? ""}
          className="size-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        delayMs={src ? 400 : 0}
        className="text-accent-800 flex size-full items-center justify-center font-medium"
      >
        {name ? getInitials(name) : "?"}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
