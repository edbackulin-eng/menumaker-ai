import { MODERN_PALETTE } from "@/components/menu-render/modern/modern-palette";

/**
 * Badge labels come from `item.badges`, which analyzeMenu generates freely
 * (see analyze-menu.ts's prompt) rather than picking from a fixed list — so
 * this maps by meaning, not by exhaustive enumeration: anything dietary
 * reads green, everything else (Chef's pick, New, Spicy…) reads gold.
 * An unrecognised label still renders, in gold, rather than disappearing or
 * throwing — a badge the model invented is a display question, never an
 * error.
 *
 * Matching is lowercase-and-trimmed because the model's casing isn't
 * guaranteed stable across runs.
 */
const DIETARY_BADGES = new Set(["vegetarian", "vegan", "gluten-free", "gluten free"]);

export function ModernBadge({ label }: { label: string }) {
  const isDietary = DIETARY_BADGES.has(label.trim().toLowerCase());

  return (
    <span
      data-testid="modern-badge"
      style={{
        display: "inline-block",
        marginTop: 5,
        fontSize: 9.5,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: isDietary ? MODERN_PALETTE.badgeVeg : MODERN_PALETTE.gold,
        border: `0.5px solid ${isDietary ? MODERN_PALETTE.badgeVegBorder : MODERN_PALETTE.badgeGoldBorder}`,
        padding: "2px 6px",
        borderRadius: 3,
      }}
    >
      {label}
    </span>
  );
}
