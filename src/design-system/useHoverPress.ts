import { useState } from 'react';

/**
 * Shared hover/press state for the many small custom Pressables across the
 * app (nav items, footer links, breadcrumbs, filter rows, gallery
 * thumbnails) that render their own bespoke layout and can't go through
 * MDButton/MDIconButton/MDCard. Centralizes the two-state-plus-handlers
 * boilerplate so every interactive element in the app reaches for the same
 * pattern instead of re-inventing it (or, as before this pass, omitting it
 * entirely — see MDButton/MDIconButton/MDCard for the primitives that
 * already had a version of this baked in).
 */
export function useHoverPress() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return {
    hovered,
    pressed,
    hoverHandlers: {
      onHoverIn: () => setHovered(true),
      onHoverOut: () => setHovered(false),
    },
    pressHandlers: {
      onPressIn: () => setPressed(true),
      onPressOut: () => setPressed(false),
    },
  };
}
