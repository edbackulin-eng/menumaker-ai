import { Lock } from "lucide-react";

import { DEMO_MODE_MESSAGE } from "@/config/demo";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Stand-in shown on DEMO_MODE for pages that would otherwise open the live
 * wizard/editor (menu creation, generation, editing). Those actions are
 * blocked on the backend anyway; this makes a guest land on a tidy notice and
 * a way back, instead of a redirect loop or an empty record. Text is fixed
 * (not localized) — a decorative portfolio guard, matching the other demo
 * cosmetic stubs.
 */
export function DemoUnavailable() {
  return (
    <Container size="md" className="py-12">
      <EmptyState
        icon={Lock}
        title={DEMO_MODE_MESSAGE}
        description="Це портфоліо-версія MenuMaker AI — створення та редагування меню тут вимкнені. Перегляньте готовий приклад на дашборді."
        action={
          <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
            ← До дашборда
          </Link>
        }
      />
    </Container>
  );
}
