/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#ffffff',
    background: '#061D16',
    backgroundElement: 'rgba(13, 53, 40, 0.88)',
    backgroundSelected: 'rgba(23, 76, 57, 0.94)',
    textSecondary: '#A8C7B8',
    accent: '#62E39A',
    border: '#315C4B',
  },
  dark: {
    text: '#ffffff',
    background: '#061D16',
    backgroundElement: 'rgba(13, 53, 40, 0.88)',
    backgroundSelected: 'rgba(23, 76, 57, 0.94)',
    textSecondary: '#A8C7B8',
    accent: '#62E39A',
    border: '#315C4B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const AppPalette = {
  backgroundTop: '#063125',
  backgroundMiddle: '#0A3B2C',
  backgroundBottom: '#061D16',
  surface: 'rgba(8, 42, 31, 0.82)',
  surfaceStrong: 'rgba(13, 53, 40, 0.94)',
  border: 'rgba(120, 198, 159, 0.34)',
  accent: '#62E39A',
  accentSoft: '#93E3AD',
  muted: '#A8C7B8',
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
