import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** Removes the default browser focus outline on web text inputs; no-op on native. */
export const noWebOutline: TextStyle =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : {};

/**
 * Smooth CSS transition for hover/press micro-interactions (background,
 * border, transform, shadow) — web only, since native touch has no hover
 * and RN's press feedback is already instant/gesture-driven. Centralized
 * here so every interactive component animates with the same easing
 * instead of each hand-rolling its own `transitionProperty` string.
 */
export const webTransition: ViewStyle =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'background-color, border-color, box-shadow, transform, opacity',
        transitionDuration: '140ms',
        transitionTimingFunction: 'ease-out',
      } as unknown as ViewStyle)
    : {};

/** Cursor: pointer on web for pressable elements that aren't a native <button>; no-op on native. */
export const webPointer: ViewStyle =
  Platform.OS === 'web' ? ({ cursor: 'pointer' } as unknown as ViewStyle) : {};
