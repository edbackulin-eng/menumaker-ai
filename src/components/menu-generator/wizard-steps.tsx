import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export const WIZARD_STEPS = [
  { key: "import", label: "Імпорт" },
  { key: "review", label: "Перегляд" },
  { key: "template", label: "Шаблон" },
  { key: "result", label: "Результат" },
] as const;

export type WizardStepKey = (typeof WIZARD_STEPS)[number]["key"];

export interface WizardStepsProps {
  current: WizardStepKey;
}

/** Progress indicator for the Menu Generator wizard (Import -> Review -> Template -> Result). Purely presentational — the pages themselves own navigation/guards. */
export function WizardSteps({ current }: WizardStepsProps) {
  const currentIndex = WIZARD_STEPS.findIndex((step) => step.key === current);

  return (
    <ol className="flex items-center gap-2" aria-label="Кроки створення меню">
      {WIZARD_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "text-body-sm flex h-7 items-center gap-1.5 rounded-full px-3 font-medium",
                isCurrent && "bg-accent-400 text-white",
                isDone && "bg-accent-50 text-accent-800",
                !isCurrent && !isDone && "bg-surface-secondary text-foreground-secondary",
              )}
            >
              {isDone ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
              {step.label}
            </span>
            {index < WIZARD_STEPS.length - 1 && (
              <span className="bg-border h-px w-6" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
