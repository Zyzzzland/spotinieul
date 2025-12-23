import { Colors, getThemeColor, ThemeBackgrounds, ThemeTextColors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor() {
  const { colorTheme } = useTheme();
  return getThemeColor(colorTheme);
}

export function useThemeColors() {
  const { colorTheme } = useTheme();
  const colorScheme = useColorScheme();
  const primaryColor = getThemeColor(colorTheme);
  const isDark = colorScheme === 'dark';
  
  const hexToRgba = (hex: string, opacity: number) => {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Get themed background and text colors
  const themedBackground = ThemeBackgrounds[colorTheme][isDark ? 'dark' : 'light'];
  const themedTextColors = ThemeTextColors[colorTheme][isDark ? 'dark' : 'light'];
  const secondary = ThemeTextColors[colorTheme][isDark ? 'dark' : 'light'].icon+'15';
  return {
    primary: primaryColor,
    primaryLight: primaryColor + '30',
    primaryDark: primaryColor + '80',
    backgroundCard: secondary,
    primaryRgba: (opacity: number) => hexToRgba(primaryColor, opacity),
    background: themedBackground,
    text: themedTextColors.text,
    icon: themedTextColors.icon,
  };
}

// Combined hook that provides both base colors and themed colors
export function useAppColors() {
  const colorScheme = useColorScheme();
  const baseColors = Colors[colorScheme ?? 'light'];
  const themeColors = useThemeColors();
  
  return {
    ...baseColors,
    background: themeColors.background,
    text: themeColors.text,
    icon: themeColors.icon,
    tint: themeColors.primary,
    tabIconSelected: themeColors.primary,
    // Keep theme colors accessible
    theme: themeColors,
  };
}
