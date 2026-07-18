import { getDishPlaceholderColor } from "@/lib/utils/dish-photo-placeholder";

export interface DishPhotoPlaceholderProps {
  categoryName: string;
  className?: string;
}

/**
 * Shown whenever a dish has no usable photo — nothing found, provider rate
 * limit, provider/network error (all collapsed to `null` by
 * findDishPhoto), or a previously-valid photo URL that now 404s (see
 * DishPhotoImage's onError). A flat category-colored square with a simple
 * plate glyph, not a broken-image icon or empty space — the menu must stay
 * presentable even when a photo can't be resolved.
 */
export function DishPhotoPlaceholder({ categoryName, className }: DishPhotoPlaceholderProps) {
  const color = getDishPlaceholderColor(categoryName);
  return (
    <div
      className={className}
      role="img"
      aria-label="Фото страви недоступне"
      style={{
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <svg viewBox="0 0 24 24" width="42%" height="42%" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="#ffffff" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="3.5" stroke="#ffffff" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
