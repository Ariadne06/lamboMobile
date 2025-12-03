import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function BHWTabLayout() {
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
        name="household/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="household/[household_id]/add-family"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="household/[household_id]/update-household"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="family/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="family/[family_id]/add-member"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="family/[family_id]/member/[member_id]/add-general-health"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="family/[family_id]/member/[member_id]/index"
        options={{
          href: null, 
        }}
      />

      <Tabs.Screen
        name="family/[family_id]/member/[member_id]/update-general-health"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="family/[family_id]/update-family"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="child-health/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="child-health/create-child-health-record"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/ChildSearchModal"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/update-child-health-record"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/growth-monitoring/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/growth-monitoring/add-growth-record"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/immunization/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/medical-surgical-history/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/medical-surgical-history/add-medical-history"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/medical-surgical-history/add-surgical-history"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/supplements/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/supplements/add-supplement"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/exclusive-breastfeed/index"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="child-health/[child_health_id]/exclusive-breastfeed/add-assessment"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="general-health/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="general-health/[family_member_id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="resident/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="resident/[residentId]/update-status"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/MotherSearchModal"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/create-maternal-record"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/obstetrical-history/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/obstetrical-history/add-obstetrical-history"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/immunization/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/immunization/add-dose"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/update-maternal-record"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/medical-surgical-history/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/medical-surgical-history/add-medical-history"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/medical-surgical-history/add-surgical-history"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/checkups/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/checkups/add-checkup"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/laboratory-screening/index"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/disease-surveillance/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/pregnancy-outcome/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/pregnancy-outcome/add-outcome"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/postpartum-visits/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/postpartum-visits/add-postpartum"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/supplements/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/supplements/add-supplement"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maternal-health/[maternal_health_id]/supplements/add-deworming"
        options={{
          href: null,
        }}
      />

    </Tabs>
    
  );
}