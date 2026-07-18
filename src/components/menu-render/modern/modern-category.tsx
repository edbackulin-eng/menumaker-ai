import { ModernDishRow } from "@/components/menu-render/modern/modern-dish-row";
import { MODERN_PALETTE } from "@/components/menu-render/modern/modern-palette";
import type { MenuCategory } from "@/services/ai/schemas/menu-content";

export interface ModernCategoryProps {
  category: MenuCategory;
  currency?: string;
  showBadges: boolean;
}

/**
 * A category: serif heading with a short gold rule beneath it, then its
 * dishes. No card, no border, no fill — Modern separates categories
 * typographically rather than with boxes, which is what stops the result
 * reading as a list of panels.
 */
export function ModernCategory({ category, currency, showBadges }: ModernCategoryProps) {
  return (
    <div data-testid="modern-category" style={{ breakInside: "avoid" }}>
      <div style={{ marginBottom: 14 }}>
        <p
          data-testid="modern-category-name"
          style={{
            margin: 0,
            fontFamily: "var(--menu-heading-font)",
            fontSize: 19,
            color: MODERN_PALETTE.text,
          }}
        >
          {category.name}
        </p>
        <div
          data-testid="modern-category-rule"
          style={{ marginTop: 6, height: 2, width: 28, backgroundColor: MODERN_PALETTE.gold }}
        />
      </div>

      {category.items.map((item, index) => (
        <ModernDishRow
          key={item.id}
          item={item}
          categoryName={category.name}
          currency={currency}
          showBadges={showBadges}
          isLast={index === category.items.length - 1}
        />
      ))}
    </div>
  );
}
