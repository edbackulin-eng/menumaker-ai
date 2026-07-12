"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { type VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed end-0 top-0 z-50 flex w-full max-w-sm flex-col gap-2 p-4 sm:top-auto sm:bottom-0",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-md data-[state=open]:animate-slide-in-from-top data-[state=closed]:animate-fade-out sm:data-[state=open]:animate-slide-in-from-bottom",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-foreground",
        success: "border-success-400/30 bg-success-50 text-success-600",
        error: "border-error-400/30 bg-error-50 text-error-600",
        warning: "border-warning-400/30 bg-warning-50 text-warning-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ToastRootProps
  extends
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

export const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, ToastRootProps>(
  ({ className, variant, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  ),
);
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-body-sm font-medium", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-body-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "duration-fast absolute end-3 top-3 rounded-sm opacity-60 transition-opacity hover:opacity-100",
      "focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none",
      className,
    )}
    {...props}
  >
    <X className="size-4" aria-hidden="true" />
    <span className="sr-only">Закрити</span>
  </ToastPrimitive.Close>
));
ToastClose.displayName = "ToastClose";
