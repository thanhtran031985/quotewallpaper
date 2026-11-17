import React from 'react';
import { useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeColor = isDark ? '#0A84FF' : '#007AFF';
  const inactiveColor = isDark ? '#8E8E93' : '#8E8E93';
  const tabBgColor = isDark ? '#1C1C1E' : '#F9F9F9';
  const headerBgColor = isDark ? '#000000' : '#FFFFFF';
  const headerTextColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBgColor,
          borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA',
        },
        headerStyle: {
          backgroundColor: headerBgColor,
        },
        headerTintColor: headerTextColor,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hôm nay',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'today' : 'today-outline'}
              size={24}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Danh ngôn',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={24}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="images"
        options={{
          title: 'Ảnh',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'images' : 'images-outline'}
              size={24}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Mẫu',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'layers' : 'layers-outline'}
              size={24}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài đặt',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={24}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
    </Tabs>
  );
}
