"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

/** Mount once near the app root (see src/app/layout.tsx). Renders whatever `toast()` pushes onto the store. */
export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, duration }) => (
        <Toast
          key={id}
          variant={variant}
          duration={duration}
          onOpenChange={(open) => {
            if (!open) dismiss(id);
          }}
        >
          <div className="flex flex-col gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
