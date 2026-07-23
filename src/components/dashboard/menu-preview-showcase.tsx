import { DEMO_MENU_CONTENT } from "@/config/demo-menu-preview";
import { MENU_EDITOR_FONT_VARIABLES_CLASSNAME } from "@/lib/fonts/menu-fonts";
import type { ResolvedMenuStyle } from "@/lib/utils/resolve-menu-style";
import { MenuStaticView } from "@/components/menu-render/menu-static-view";
import {
  MenuPreviewCarousel,
  type MenuPreviewSlide,
} from "@/components/dashboard/menu-preview-carousel";

export interface MenuPreviewShowcaseSlide {
  id: string;
  label: string;
  style: ResolvedMenuStyle;
}

export interface MenuPreviewShowcaseProps {
  slides: MenuPreviewShowcaseSlide[];
}

/**
 * Server half of the empty-state preview: renders each layout engine's real
 * DOM tree — the same MenuStaticView the editor, the public menu page and
 * every other preview in the app use — and hands the finished markup to the
 * client carousel.
 *
 * The split matters for weight. All four menus are rendered on the server
 * into the RSC payload, so the client bundle gains only the carousel's own
 * controls; none of the four engines' code is shipped. It also costs no
 * extra database work: the dashboard page already loads every template row
 * for its own menu list.
 *
 * Forced to a single column because the stage is one narrow scaled panel —
 * a two-column menu at preview scale is unreadable, and unreadable is the
 * exact failure this screen is replacing.
 */
export function MenuPreviewShowcase({ slides }: MenuPreviewShowcaseProps) {
  const carouselSlides: MenuPreviewSlide[] = slides.map((slide) => ({
    id: slide.id,
    label: slide.label,
    content: (
      <div className={MENU_EDITOR_FONT_VARIABLES_CLASSNAME}>
        <MenuStaticView content={DEMO_MENU_CONTENT} style={{ ...slide.style, columns: 1 }} />
      </div>
    ),
  }));

  return <MenuPreviewCarousel slides={carouselSlides} />;
}
