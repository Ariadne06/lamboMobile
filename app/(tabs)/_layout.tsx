import { Tabs } from 'expo-router';
import React from 'react';
import { Platform} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF3D33',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 0,
          },
          default: {
            backgroundColor: '#ffffff', 
            borderTopWidth: 0,
            elevation: 0,
          },
        }),
      }}>

      
      <Tabs.Screen
        name="announcement"
        options={{
          title: 'Announcements',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="megaphone" color={color} />,
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="menu" color={color} />,
        }}
      />

      {/* HIDDEN: DevTest tab - only show in development when needed */}
      <Tabs.Screen
        name="devtest"
        options={{
          href: null, // This completely hides the tab
          title: 'Dev Test',
        }}
      />

    </Tabs>
  );
}