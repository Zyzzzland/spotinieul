import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { MiniPlayer } from '@/components/mini-player';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Fontisto } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#1DB954',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopWidth: 1,
            borderTopColor: '#282828',
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color }) => <Fontisto name="music-note" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="playlists"
          options={{
            title: 'Playlists',
            tabBarIcon: ({ color }) => <Fontisto name="play-list" size={18} color={color} />,
          }}
        />
        
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
