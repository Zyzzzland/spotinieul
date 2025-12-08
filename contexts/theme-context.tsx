import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ColorThemeType = 'blue' | 'red' | 'pink' | 'green' | 'purple' | 'orange' | 'cyan' | 'yellow';

interface ThemeContextType {
  colorTheme: ColorThemeType;
  setColorTheme: (theme: ColorThemeType) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorThemeType>('green');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app-color-theme');
        const validThemes: ColorThemeType[] = ['blue', 'red', 'pink', 'green', 'purple', 'orange', 'cyan', 'yellow'];
        if (savedTheme && validThemes.includes(savedTheme as ColorThemeType)) {
          setColorThemeState(savedTheme as ColorThemeType);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setColorTheme = async (newTheme: ColorThemeType) => {
    try {
      await AsyncStorage.setItem('app-color-theme', newTheme);
      setColorThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
