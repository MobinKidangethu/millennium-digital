import { useWindowDimensions } from 'react-native';
import { breakpoints } from './tokens';

export type BreakpointName = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface Responsive {
  width: number;
  breakpoint: BreakpointName;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** tablet and up */
  isTabletUp: boolean;
  /** desktop and up */
  isDesktopUp: boolean;
}

export function useResponsive(): Responsive {
  const { width } = useWindowDimensions();

  let breakpoint: BreakpointName = 'mobile';
  if (width >= breakpoints.wide) breakpoint = 'wide';
  else if (width >= breakpoints.desktop) breakpoint = 'desktop';
  else if (width >= breakpoints.tablet) breakpoint = 'tablet';

  return {
    width,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
    isTabletUp: width >= breakpoints.tablet,
    isDesktopUp: width >= breakpoints.desktop,
  };
}
