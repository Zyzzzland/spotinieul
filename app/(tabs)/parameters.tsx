import { ThemePreviewColors } from '@/constants/theme';
import type { ColorThemeType } from '@/contexts/theme-context';
import { useTheme } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppColors } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ParametersScreen() {
  const colors = useAppColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { colorTheme, setColorTheme } = useTheme();

  const colorOptions: ColorThemeType[] = ['blue', 'red', 'pink', 'green'];
  const colorLabels: Record<ColorThemeType, string> = {
    blue: 'Bleu',
    red: 'Rouge',
    pink: 'Rose',
    green: 'Vert',
  };

  const themeIcons: Record<ColorThemeType, keyof typeof Ionicons.glyphMap> = {
    blue: 'water',
    red: 'flame',
    pink: 'heart',
    green: 'leaf',
  };

  const getThemeAccentColor = (theme: ColorThemeType) => {
    const themeColors = ThemePreviewColors[theme][isDark ? 'dark' : 'light'];
    return themeColors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header with gradient effect */}
        <View style={[styles.headerContainer, { borderBottomColor: getThemeAccentColor(colorTheme) + '30' }]}>
          <View style={styles.headerContent}>
            <Ionicons name="settings" size={32} color={getThemeAccentColor(colorTheme)} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Paramètres</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.icon }]}>Personnalisez votre expérience</Text>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={24} color={getThemeAccentColor(colorTheme)} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Thème de couleur</Text>
          </View>

          {/* Theme Preview Cards */}
          <View style={styles.themePreviewContainer}>
            {colorOptions.map((theme) => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.themePreviewCard,
                  {
                    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                    borderColor: colorTheme === theme ? getThemeAccentColor(theme) : (isDark ? '#444' : '#ddd'),
                    borderWidth: colorTheme === theme ? 2 : 1,
                  },
                ]}
                onPress={() => setColorTheme(theme)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={themeIcons[theme]}
                  size={28}
                  color={getThemeAccentColor(theme)}
                />
                <Text style={[styles.themePreviewLabel, { color: colors.text }]}>
                  {colorLabels[theme]}
                </Text>
                {colorTheme === theme && (
                  <View style={[styles.checkmark, { backgroundColor: getThemeAccentColor(theme) }]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color={getThemeAccentColor(colorTheme)} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>À propos</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', borderLeftColor: getThemeAccentColor(colorTheme) }]}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="cube" size={20} color={getThemeAccentColor(colorTheme)} />
              <Text style={[styles.infoLabel, { color: colors.icon }]}>Version de l'app</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', borderLeftColor: getThemeAccentColor(colorTheme) }]}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="color-palette" size={20} color={getThemeAccentColor(colorTheme)} />
              <Text style={[styles.infoLabel, { color: colors.icon }]}>Thème sélectionné</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {colorLabels[colorTheme]}
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', borderLeftColor: getThemeAccentColor(colorTheme) }]}>
            <View style={styles.infoCardHeader}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={getThemeAccentColor(colorTheme)} />
              <Text style={[styles.infoLabel, { color: colors.icon }]}>Mode</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {isDark ? 'Sombre' : 'Clair'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    marginLeft: 44,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  themePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  themePreviewCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    position: 'relative',
  },
  themePreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 32,
  },
});
