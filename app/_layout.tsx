import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { FlashcardProvider } from '@/contexts/flashcard-context';
import { MusicProvider } from '@/contexts/music-context';
import { ThemeProvider as AppThemeProvider } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppThemeProvider>
      <MusicProvider>
        <FlashcardProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="player" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="topic/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="study/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
        </FlashcardProvider>
      </MusicProvider>
    </AppThemeProvider>
  );
}
