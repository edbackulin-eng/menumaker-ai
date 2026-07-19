import type { ResolvedMenuStyle } from "@/lib/utils/resolve-menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";

/**
 * The single prop shape every layout engine's DOM component accepts.
 *
 * Uniform on purpose: it is what lets DOM_ENGINE_REGISTRY be a plain
 * `Record<MenuLayoutEngine, ComponentType<MenuEngineViewProps>>` and have
 * TypeScript check exhaustively that every engine has a component. If each
 * engine took its own prop shape, the registry would need a union and the
 * lookup would need a cast, which is exactly the hole the registry exists
 * to close.
 *
 * The consequence is that engines receive props they don't use — the
 * classic engine has no banner for `menuTitle` and no footer for the QR.
 * That is intended: an engine using a subset of the shared inputs is
 * normal, and far cheaper than per-engine plumbing at every call site.
 */
export interface MenuEngineViewProps {
  content: MenuContent;
  style: ResolvedMenuStyle;
  /**
   * Fallback for a banner heading when `content.venue.name` is unset —
   * normally the menu's own title. Engines without a banner ignore it.
   */
  menuTitle?: string;
  /** Pre-rendered QR for a footer. Only meaningful for engines that have one, and only when the menu is published. */
  qrDataUri?: string;
  /** Footer QR caption, localized in the menu's content locale. */
  qrLabel?: string;
}
