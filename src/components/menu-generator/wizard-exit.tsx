"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { useRouter } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * "Exit to dashboard" for the menu-generator wizard. Before this, a user who
 * pressed "New menu" had no way back to the dashboard except finishing the
 * whole flow — a trap.
 *
 * A step with unsaved client-only work (the import form's typed text, the
 * review editor's un-confirmed edits, the style editor's un-flushed autosave)
 * reports that via `useReportWizardDirty(true)`. The exit button reads it
 * from context and, when dirty, asks for confirmation before leaving; when
 * clean it just leaves, no prompt. A `beforeunload` handler covers the other
 * exits (refresh, tab close, browser back) that a click handler can't.
 *
 * Steps whose progress is already persisted server-side (template selection,
 * result) report nothing, so `isDirty` stays false and exit is immediate.
 * The menu's row in the DB is the source of truth for "where was I" — the
 * wizard pages already redirect a returning user to the right step from
 * `status` / `content_confirmed_at`, so exiting never loses your place.
 */
interface WizardDirtyContextValue {
  setDirty: (dirty: boolean) => void;
  isDirtyRef: React.RefObject<boolean>;
  subscribe: (listener: () => void) => () => void;
}

const WizardDirtyContext = createContext<WizardDirtyContextValue | null>(null);

export function WizardExitProvider({ children }: { children: React.ReactNode }) {
  const isDirtyRef = useRef(false);
  const listenersRef = useRef(new Set<() => void>());

  const setDirty = useCallback((dirty: boolean) => {
    if (isDirtyRef.current === dirty) return;
    isDirtyRef.current = dirty;
    listenersRef.current.forEach((l) => l());
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  return (
    <WizardDirtyContext.Provider value={{ setDirty, isDirtyRef, subscribe }}>
      {children}
    </WizardDirtyContext.Provider>
  );
}

/** Called by a step's client component to publish whether it has unsaved work. No-op outside a provider, so a step can use it unconditionally. */
export function useReportWizardDirty(dirty: boolean): void {
  const ctx = useContext(WizardDirtyContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setDirty(dirty);
    return () => ctx.setDirty(false);
  }, [ctx, dirty]);
}

export function WizardExitButton() {
  const t = useTranslations("menuGenerator.exit");
  const router = useRouter();
  const ctx = useContext(WizardDirtyContext);
  if (!ctx) {
    // A hard error, not a silent fallback: the button used to work outside a
    // provider by defaulting isDirty to false, which meant a step that later
    // grew a dirty state (e.g. Template gaining preset selection in Stage 3)
    // would lose its unsaved-work guard with no warning. Every wizard step
    // wraps its content in WizardExitProvider; forgetting to is a bug to
    // surface at dev time, not ship.
    throw new Error("WizardExitButton must be rendered inside a WizardExitProvider");
  }
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Mirror the ref into state only so this button re-renders when dirtiness
  // flips — the actual guard reads the ref, which is always current.
  const [, force] = useState(0);

  useEffect(() => {
    return ctx.subscribe(() => force((n) => n + 1));
  }, [ctx]);

  const isDirty = ctx.isDirtyRef.current;

  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function handleClick() {
    if (isDirty) {
      setConfirmOpen(true);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        data-testid="wizard-exit"
        className="text-foreground-secondary hover:text-foreground focus-visible:ring-ring duration-fast text-body-sm mb-4 inline-flex items-center gap-1.5 rounded-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("toDashboard")}
      </button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmTitle")}</DialogTitle>
            <DialogDescription>{t("confirmDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>
              {t("stay")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-testid="wizard-exit-confirm"
              onClick={() => router.push("/dashboard")}
            >
              {t("leave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
