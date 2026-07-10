"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>["side"];
  align?: React.ComponentProps<typeof TooltipPrimitive.Content>["align"];
  delayDuration?: number;
}

/**
 * Self-contained (bundles its own Provider) so it works standalone without
 * requiring the whole app to be wrapped in a top-level TooltipProvider.
 * Wrap the app root in a single TooltipProvider instead if shared hover
 * delay/skip-delay behavior across many tooltips becomes important later.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 200,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            className={cn(
              "text-caption z-50 rounded-sm bg-neutral-900 px-2.5 py-1.5 text-white shadow-md",
              "data-[state=delayed-open]:animate-fade-in",
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-neutral-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
