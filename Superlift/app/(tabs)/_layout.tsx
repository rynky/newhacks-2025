import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1A1620' : '#E8E6E5', // Muted background
          borderTopColor: colorScheme === 'dark' ? '#332940' : '#D0CECB',
          borderTopWidth: 1,
          paddingTop: 8, // Extra padding above icons
          paddingBottom: 8, // Padding above the notch
          height: 88, // Taller to accommodate safe area
        },
        tabBarLabelStyle: {
          paddingBottom: 2,
          fontSize: 11,
        },
        tabBarIconStyle: {
          marginTop: 1,
        },
      }}>
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.strengthtraining.traditional" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />,
        }}
      />
    </Tabs>
  );
}
