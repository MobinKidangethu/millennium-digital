import { Platform, type TextStyle } from 'react-native';

/** Removes the default browser focus outline on web text inputs; no-op on native. */
export const noWebOutline: TextStyle =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : {};
