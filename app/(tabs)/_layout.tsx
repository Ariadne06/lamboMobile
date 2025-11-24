import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

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
        name="index"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="menu" color={color} />,
        }}
      />

      <Tabs.Screen
        name="announcement"
        options={{
          title: 'Announcements',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="megaphone" color={color} />,
        }}
      />

      {/* Hidden routes - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="health"
        options={{
          href: null,
          title: 'Health Records',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: 'Profile',
        }}
      />

      <Tabs.Screen
        name="household"
        options={{
          href: null,
          title: 'Household',
        }}
      />

      <Tabs.Screen
        name="business"
        options={{
          href: null,
          title: 'Business',
        }}
      />

      <Tabs.Screen
        name="documents"
        options={{
          href: null,
          title: 'Documents',
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          href: null,
          title: 'Transactions',
        }}
      />

      {/* HIDDEN: DevTest tab - only show in development when needed */}
      <Tabs.Screen
        name="devtest"
        options={{
          href: null,
          title: 'Dev Test',
        }}
      />

    </Tabs>
  );
}