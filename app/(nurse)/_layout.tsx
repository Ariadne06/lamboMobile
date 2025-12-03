import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function NurseTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF3D33', // Active icon color
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
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="menu" color={color} />,
        }}
      />

      <Tabs.Screen
        name="child-health/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/exclusive-breastfeed/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/growth-monitoring/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/immunization/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/immunization/add-immunization"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/medical-surgical-history/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/supplements/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="maternal-health/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/obstetrical-history/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/supplements/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/immunization/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/checkups/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/checkups/[checkup_id]/update-checkup"
        options={{ href: null }}
      />
    </Tabs>
  );
}