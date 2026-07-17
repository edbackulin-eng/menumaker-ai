"use client";

import { useTranslations } from "next-intl";

import type { CreditBlock } from "@/services/dashboard/get-summary";
import { Link } from "@/i18n/navigation";

export interface SidebarCreditsBlockProps {
  block: CreditBlock;
}

/**
 * The sidebar's bottom anchor. One layout, two data modes — see CreditBlock
 * in services/dashboard/get-summary.ts for why the "free" mode exists at all
 * (short version: nobody has purchasable credits yet, so a credits-only bar
 * would read empty for every user).
 *
 * The bar always renders. `fillRatio` is pre-clamped server-side, so there
 * is no divide-by-zero or over-100% case to defend against here.
 */
export function SidebarCreditsBlock({ block }: SidebarCreditsBlockProps) {
  const t = useTranslations("nav.credits");

  const label = block.mode === "free" ? t("freeMenuTitle") : t("creditsTitle");
  const value =
    block.mode === "free"
      ? t("freeMenuValue", { left: block.value, total: block.total })
      : t("creditsValue", { left: block.value, total: block.total });

  return (
    <div className="border-border bg-surface mt-auto rounded-[10px] border p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-caption text-foreground-secondary">{label}</span>
        <span className="text-caption text-foreground font-medium">{value}</span>
      </div>

      <div
        className="mb-2.5 h-[5px] w-full overflow-hidden rounded-[3px] bg-neutral-700"
        role="progressbar"
        aria-valuenow={Math.round(block.fillRatio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="bg-accent-500 h-full rounded-[3px]"
          style={{ width: `${block.fillRatio * 100}%` }}
        />
      </div>

      <Link
        href="/dashboard/credits"
        // neutral-100 rather than the mockup's one-off #c8c8ce: one rung
        // lighter, imperceptible on this fill (12.55:1 vs 11.13:1), and it
        // avoids a thirteenth grey that no other component would ever reuse.
        className="border-border-strong text-caption hover:bg-surface-secondary focus-visible:ring-ring duration-fast flex h-[30px] items-center justify-center rounded-[7px] border text-neutral-100 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {t("topUp")}
      </Link>
    </div>
  );
}
