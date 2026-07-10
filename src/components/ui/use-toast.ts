"use client";

import * as React from "react";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
// Stable reference: useSyncExternalStore requires getServerSnapshot to
// return the same value across calls, not just an equal one — a fresh `[]`
// literal each call trips React's "should be cached" infinite-loop guard.
const EMPTY_TOASTS: ToastItem[] = [];

function emit() {
  for (const listener of listeners) listener(toasts);
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function toast(item: Omit<ToastItem, "id">) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, duration: 5000, variant: "default", ...item }];
  emit();
  return id;
}

/** External store (module-level, SSR-safe via useSyncExternalStore) so `toast()` can be called from anywhere, not just inside a Provider's subtree. */
export function useToast() {
  const subscribe = React.useCallback((listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const getSnapshot = React.useCallback(() => toasts, []);
  const getServerSnapshot = React.useCallback(() => EMPTY_TOASTS, []);

  const currentToasts = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { toasts: currentToasts, toast, dismiss };
}
