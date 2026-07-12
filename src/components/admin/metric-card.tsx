import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}

export function MetricCard({ label, value, icon: Icon, hint }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div>
          <p className="text-body-sm text-foreground-secondary">{label}</p>
          <p className="text-h3 text-foreground mt-1">{value}</p>
          {hint && <p className="text-caption text-foreground-tertiary mt-1">{hint}</p>}
        </div>
        <div className="bg-accent-50 text-accent-600 flex size-9 shrink-0 items-center justify-center rounded-md">
          <Icon className="size-4.5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
