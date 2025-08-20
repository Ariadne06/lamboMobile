import React from 'react';
import { View, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useRegister } from '@/context/registercontext';

const BRAND = '#FF3D33';
const INK = '#1e293b';
const MUTED = '#64748b';
const SURFACE = '#ffffff';
const CANVAS = '#f6f7fb';

export default function UserTypeSelection() {
  const { setFormData } = useRegister();

  const handleResidentChoice = () => {
    setFormData((prev: any) => ({
      ...prev,
      user_type: 'resident',
      registration_function: 'register_verified_resident'
    }));
    router.push('/(auth)/register');
  };

  const handleNonResidentChoice = () => {
    setFormData((prev: any) => ({
      ...prev,
      user_type: 'non_resident',
      registration_function: 'register_verified_business_owner'
    }));
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>
            Registration Type
          </ThemedText>
          <ThemedText style={styles.headerDesc}>
            Choose the option that best describes you
          </ThemedText>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.card, styles.cardHighlight]}
            onPress={handleResidentChoice}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Register as Resident"
            accessibilityHint="Opens the resident registration form"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="btn-resident"
          >
            <View style={styles.cardRow}>
              <View style={styles.iconBadge}><ThemedText style={styles.iconText}>🏠</ThemedText></View>
              <View style={styles.cardTextCol}>
                <ThemedText style={styles.cardTitle}>Resident</ThemedText>
                <ThemedText style={styles.cardDesc}>I live in the barangay.</ThemedText>
              </View>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={handleNonResidentChoice}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Register as Non-Resident Business Owner"
            accessibilityHint="Opens the non-resident registration form"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="btn-nonresident"
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconBadge, styles.iconNeutral]}><ThemedText style={styles.iconText}>🚫</ThemedText></View>
              <View style={styles.cardTextCol}>
                <ThemedText style={styles.cardTitle}>Non-Resident</ThemedText>
                <ThemedText style={styles.cardDesc}>I don’t live in the barangay.</ThemedText>
              </View>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to Login"
            accessibilityHint="Returns to the login screen"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="btn-back"
          >
            <ThemedText style={styles.backButtonText}>Back to Login</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CANVAS,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: INK,
    letterSpacing: 0.3,
    marginBottom: 6,
    paddingVertical: 20,
  },
  headerDesc: {
    fontSize: 15.5,
    color: MUTED,
    textAlign: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    marginTop: 20,
  },

  // Card base
  card: {
    backgroundColor: SURFACE,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#e6e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  // Accent for the primary choice
  cardHighlight: {
    // borderColor: BRAND,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    height: 44,
    width: 44,
    borderRadius: 12,
    backgroundColor: '#ffe9e7', // brand tint
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconNeutral: {
    backgroundColor: '#eef2f7',
  },
  iconText: {
    fontSize: 22,
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18.5,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 14.5,
    color: MUTED,
  },
  chevron: {
    fontSize: 28,
    color: '#94a3b8',
    marginLeft: 8,
  },

  backButton: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BRAND,
    backgroundColor: '#FF3D33',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
