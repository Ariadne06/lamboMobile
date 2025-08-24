import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';

export default function HouseholdMenu() {
  const router = useRouter();

  const menuOptions = [
    {
      id: 1,
      title: 'Add Household',
      subtitle: 'Register a new household',
      icon: 'add-circle-outline',
      color: '#10B981',
      route: '/menu/addhousehold',
    },
    {
      id: 2,
      title: 'View Households',
      subtitle: 'Browse existing household records',
      icon: 'list-outline',
      color: '#3B82F6',
      route: '/menu/viewhousehold',
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Household Management" />
      
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="home" size={48} color="#FF3D33" />
          </View>
          <ThemedText style={styles.title}>Household Records</ThemedText>
          <ThemedText style={styles.subtitle}>
            Manage household registration and records
          </ThemedText>
        </View>

        <View style={styles.menuContainer}>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuCard}
              onPress={() => handleNavigation(option.route)}
            >
              <View style={[styles.iconBox, { backgroundColor: `${option.color}15` }]}>
                <Ionicons name={option.icon as any} size={32} color={option.color} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.menuTitle}>{option.title}</ThemedText>
                <ThemedText style={styles.menuSubtitle}>{option.subtitle}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  menuContainer: {
    gap: 16,
    marginBottom: 32,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
});
