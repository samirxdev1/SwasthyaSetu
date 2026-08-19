import { Platform } from 'react-native';

export const Colors = {
  primary: '#0F6E5C',
  primaryLight: '#E7F3EF',
  text: '#1C2B2A',
  textSecondary: '#5A6B69',
  background: '#F7F6F3',
  surface: '#FFFFFF',
  border: '#E0DED9',
  alert: '#C9754A',
  signalBlue: '#3B7A9E',
  honeyGold: '#E3A857',
  success: '#2E7D32',
  error: '#C62828',
  warmFog: '#F7F6F3',
  softSage: '#E7F3EF',
  deepTeal: '#0F6E5C',
  inkSlate: '#1C2B2A',
  mutedClay: '#C9754A',
};

export type ThemeColor = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    heading: 'Sora',
    body: 'Inter',
    mono: 'IBM Plex Mono',
  },
  default: {
    heading: 'normal',
    body: 'normal',
    mono: 'monospace',
  },
  web: {
    heading: 'Sora, Manrope, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'IBM Plex Mono, ui-monospace, monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  smallBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 19 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },
  mono: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
export const MinTapTarget = 44;
