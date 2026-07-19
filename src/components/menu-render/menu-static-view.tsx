import type { ComponentType } from "react";

import type { MenuLayoutEngine } from "@/lib/utils/resolve-menu-style";
import type { MenuEngineViewProps } from "@/components/menu-render/engine-view-props";
import { ClassicMenuView } from "@/components/menu-render/classic/classic-menu-view";
import { ModernMenuView } from "@/components/menu-render/modern/modern-menu-view";

export type MenuStaticViewProps = MenuEngineViewProps;

/**
 * Which DOM component draws each layout engine.
 *
 * A `Record<MenuLayoutEngine, ...>` rather than an if-chain, and that is
 * the whole point: it is *exhaustive*. Adding an engine to MenuLayoutEngine
 * makes this object fail to typecheck until an entry exists, and the same
 * happens in the Satori and react-pdf registries — so a half-finished
 * engine cannot ship rendering correctly on the web while silently falling
 * back to the classic tree in the PDF, which is exactly the failure an
 * if-chain's `else` invites.
 *
 * Deliberately three separate registries, one colocated with each
 * renderer, not one shared table: the Satori and react-pdf renderers are
 * `import "server-only"`, and a combined registry imported by this file
 * (which client components like TemplateGallery render) would drag server
 * code into the client bundle.
 */
const DOM_ENGINE_REGISTRY: Record<MenuLayoutEngine, ComponentType<MenuEngineViewProps>> = {
  classic: ClassicMenuView,
  "banner-two-column": ModernMenuView,
};

/**
 * Read-only equivalent of the editor's MenuLivePreview (Stage 7.5) — same
 * visual output, but no dnd-kit anywhere in the tree. Used by the public web
 * menu page (app/m/[slug]) and every preview surface: a visitor scanning a
 * QR code at a table has no business seeing drag handles, and dnd-kit's
 * `useSortable()` requires a DndContext ancestor those pages deliberately
 * don't have.
 *
 * Since Stage 3 this component holds no layout logic of its own — it is the
 * DOM renderer's single engine dispatch point, and each engine's tree lives
 * in its own directory under menu-render/.
 */
export function MenuStaticView(props: MenuStaticViewProps) {
  const EngineView = DOM_ENGINE_REGISTRY[props.style.layoutEngine];
  return <EngineView {...props} />;
}
