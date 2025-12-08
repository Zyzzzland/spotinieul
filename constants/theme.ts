/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import type { ColorThemeType } from '@/contexts/theme-context';
import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Color theme definitions
export const ColorThemes: Record<ColorThemeType, string> = {
  blue: '#2196F3',
  red: '#F44336',
  pink: '#E91E63',
  green: '#1DB954',
  purple: '#9C27B0',
  orange: '#FF9800',
  cyan: '#00BCD4',
  yellow: '#FFC107',
};

// Color theme variants for light and dark mode
export const ColorThemeVariants: Record<ColorThemeType, { light: string; dark: string }> = {
  blue: {
    light: '#2196F3',
    dark: '#3D5A80',
  },
  red: {
    light: '#F44336',
    dark: '#6B3A3A',
  },
  pink: {
    light: '#E91E63',
    dark: '#6B3A52',
  },
  green: {
    light: '#1DB954',
    dark: '#3D5A3D',
  },
  purple: {
    light: '#9C27B0',
    dark: '#6B3A6B',
  },
  orange: {
    light: '#FF9800',
    dark: '#6B4A2A',
  },
  cyan: {
    light: '#00BCD4',
    dark: '#2A5A6B',
  },
  yellow: {
    light: '#FFC107',
    dark: '#6B5A2A',
  },
};

// Background colors for each theme (light and dark variants)
export const ThemeBackgrounds: Record<ColorThemeType, { light: string; dark: string }> = {
  blue: {
    light: '#E3F2FD', // Light blue background
    dark: '#0A1929',   // Dark blue background
  },
  red: {
    light: '#FFEBEE', // Light red background
    dark: '#1A0A0A',  // Dark red background
  },
  pink: {
    light: '#FCE4EC', // Light pink background
    dark: '#1A0A14',  // Dark pink background
  },
  green: {
    light: '#E8F5E9', // Light green background
    dark: '#0A1A0A',  // Dark green background
  },
  purple: {
    light: '#F3E5F5', // Light purple background
    dark: '#1A0A1A',  // Dark purple background
  },
  orange: {
    light: '#FFF3E0', // Light orange background
    dark: '#1A0F0A',  // Dark orange background
  },
  cyan: {
    light: '#E0F2F1', // Light cyan background
    dark: '#0A1A1A',  // Dark cyan background
  },
  yellow: {
    light: '#FFFDE7', // Light yellow background
    dark: '#1A1A0A',  // Dark yellow background
  },
};

// Text and icon colors that work with themed backgrounds
export const ThemeTextColors: Record<ColorThemeType, { light: { text: string; icon: string }; dark: { text: string; icon: string } }> = {
  blue: {
    light: { text: '#0D47A1', icon: '#1976D2' },
    dark: { text: '#E3F2FD', icon: '#90CAF9' },
  },
  red: {
    light: { text: '#B71C1C', icon: '#C62828' },
    dark: { text: '#FFEBEE', icon: '#EF5350' },
  },
  pink: {
    light: { text: '#880E4F', icon: '#AD1457' },
    dark: { text: '#FCE4EC', icon: '#F48FB1' },
  },
  green: {
    light: { text: '#1B5E20', icon: '#2E7D32' },
    dark: { text: '#E8F5E9', icon: '#66BB6A' },
  },
  purple: {
    light: { text: '#4A148C', icon: '#7B1FA2' },
    dark: { text: '#F3E5F5', icon: '#CE93D8' },
  },
  orange: {
    light: { text: '#E65100', icon: '#F57C00' },
    dark: { text: '#FFF3E0', icon: '#FFB74D' },
  },
  cyan: {
    light: { text: '#00838F', icon: '#0097A7' },
    dark: { text: '#E0F2F1', icon: '#80DEEA' },
  },
  yellow: {
    light: { text: '#F57F17', icon: '#FBC02D' },
    dark: { text: '#FFFDE7', icon: '#FFD54F' },
  },
};

// Theme preview colors for the theme selector (light and dark variants)
export const ThemePreviewColors: Record<ColorThemeType, { light: { primary: string; secondary: string; accent: string }; dark: { primary: string; secondary: string; accent: string } }> = {
  blue: {
    light: { primary: '#2196F3', secondary: '#E3F2FD', accent: '#1976D2' },
    dark: { primary: '#3D5A80', secondary: '#1A2A3D', accent: '#5A7FA3' },
  },
  red: {
    light: { primary: '#F44336', secondary: '#FFEBEE', accent: '#C62828' },
    dark: { primary: '#6B3A3A', secondary: '#3D1F1F', accent: '#8B5A5A' },
  },
  pink: {
    light: { primary: '#E91E63', secondary: '#FCE4EC', accent: '#AD1457' },
    dark: { primary: '#6B3A52', secondary: '#3D1F2A', accent: '#8B5A7A' },
  },
  green: {
    light: { primary: '#1DB954', secondary: '#E8F5E9', accent: '#2E7D32' },
    dark: { primary: '#3D5A3D', secondary: '#1F3D1F', accent: '#5A8A5A' },
  },
  purple: {
    light: { primary: '#9C27B0', secondary: '#F3E5F5', accent: '#7B1FA2' },
    dark: { primary: '#6B3A6B', secondary: '#3D1F3D', accent: '#8B5A8B' },
  },
  orange: {
    light: { primary: '#FF9800', secondary: '#FFF3E0', accent: '#F57C00' },
    dark: { primary: '#6B4A2A', secondary: '#3D2A1F', accent: '#8B6A3A' },
  },
  cyan: {
    light: { primary: '#00BCD4', secondary: '#E0F2F1', accent: '#0097A7' },
    dark: { primary: '#2A5A6B', secondary: '#1F3D3D', accent: '#4A7A8B' },
  },
  yellow: {
    light: { primary: '#FFC107', secondary: '#FFFDE7', accent: '#FBC02D' },
    dark: { primary: '#6B5A2A', secondary: '#3D3D1F', accent: '#8B7A3A' },
  },
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Helper function to get theme color
export function getThemeColor(colorTheme: ColorThemeType): string {
  return ColorThemes[colorTheme];
}

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
