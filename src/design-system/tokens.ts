import { Platform } from 'react-native';

/**
 * Brand palette sampled directly from assets/Millenium_Logo_new.png
 * (plum ring ~#93386C, graphite wordmark ~#808183). Every other shade
 * in each scale is derived from that anchor, not invented separately.
 */
const plum = {
  50: '#FBF3F7',
  100: '#F3E1EC',
  200: '#E6C0D6',
  300: '#D296B9',
  400: '#B86694',
  500: '#A04A79',
  600: '#93386C',
  700: '#7A2D59',
  800: '#602347',
  900: '#481A36',
};

const gray = {
  0: '#FFFFFF',
  50: '#FAFAFA',
  100: '#F3F2F3',
  200: '#E4E3E5',
  300: '#CBCACD',
  400: '#A7A6A9',
  500: '#808183',
  600: '#666568',
  700: '#4E4D50',
  800: '#38373A',
  900: '#232226',
};

const green = {
  50: '#EAF6EF',
  500: '#1E7B4D',
  600: '#186A41',
};

const amber = {
  50: '#FBF2E3',
  500: '#B7791F',
  600: '#9C6418',
};

const red = {
  50: '#FBEAE8',
  500: '#C0392B',
  600: '#A32E22',
};

export const colors = {
  plum,
  gray,
  green,
  amber,
  red,

  brand: {
    primary: plum[600],
    primaryHover: plum[700],
    primaryPressed: plum[800],
    primarySoft: plum[50],
    primarySoftBorder: plum[200],
    accent: plum[400],
    secondary: gray[800],
  },

  background: gray[0],
  surface: gray[50],
  surfaceRaised: gray[0],
  border: gray[200],
  borderStrong: gray[300],

  text: {
    primary: gray[900],
    secondary: gray[600],
    tertiary: gray[500],
    inverse: gray[0],
    onPrimary: gray[0],
    link: plum[600],
  },

  status: {
    success: green[500],
    successSoft: green[50],
    successStrong: green[600],
    warning: amber[500],
    warningSoft: amber[50],
    warningStrong: amber[600],
    error: red[500],
    errorSoft: red[50],
    errorStrong: red[600],
    info: plum[500],
    infoSoft: plum[50],
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const shadow = {
  none: {},
  sm: Platform.select({
    web: { boxShadow: '0 1px 2px rgba(35,34,38,0.06)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
  }),
  md: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(35,34,38,0.08)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  }),
  lg: Platform.select({
    web: { boxShadow: '0 12px 32px rgba(35,34,38,0.12)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 6,
    },
  }),
};

const fontFamily = Platform.select({
  ios: { base: 'System', heading: 'System' },
  android: { base: 'sans-serif', heading: 'sans-serif-medium' },
  default: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    heading:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
})!;

export const typography = {
  fontFamily,
  display: { fontSize: 34, lineHeight: 42, fontWeight: '700' as const },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  h2: { fontSize: 23, lineHeight: 30, fontWeight: '700' as const },
  h3: { fontSize: 19, lineHeight: 26, fontWeight: '600' as const },
  h4: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  bodySm: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.6,
  },
};

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export const layout = {
  maxContentWidth: 1280,
  headerHeight: 72,
  mobileNavHeight: 60,
};

export const zIndex = {
  header: 100,
  bottomNav: 100,
  dropdown: 200,
  modal: 300,
  toast: 400,
};
