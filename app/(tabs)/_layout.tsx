import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MiniPlayer } from '@/components/mini-player';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
            height: 0,
            opacity: 0,
            position: 'absolute',
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
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="music.note.list" color={color} />,
          }}
        />
        <Tabs.Screen
          name="playlists"
          options={{
            title: 'Playlists',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.stack.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="cast"
          options={{
            title: 'Cast',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="speaker.wave.3.fill" color={color} />,
          }}
        />
      </Tabs>
      <MiniPlayer />
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          paddingBottom: 0,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 70,
          flexDirection: 'row',
        }}
      >
        {/* Custom Tab Bar would go here if needed */}
      </View>
    </View>
  );
}
