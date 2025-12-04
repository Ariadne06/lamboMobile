import { ThemedText } from '@/components/ThemedText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// ✅ General Health Options (for the resident)
const generalHealthOptions = [
  { label: 'General Health', icon: 'heart-pulse', iconFamily: 'MaterialCommunityIcons', route: '/(tabs)/health/general-health' },
];

const maternalOptions = [
  { label: 'Medical/Surgical', icon: 'medkit', route: '/(tabs)/health/maternal/medicalsurgical' },
  { label: 'Immunization', icon: 'shield-checkmark', route: '/(tabs)/health/maternal/immunization' },
  { label: 'Obstetrical History', icon: 'woman', route: '/(tabs)/health/maternal/obstetricalhistory' },
  { label: 'Check Ups', icon: 'calendar', route: '/(tabs)/health/maternal/checkups' },
  { label: 'Screenings', icon: 'search', route: '/(tabs)/health/maternal/screenings' },
  { label: 'Lab Screening + Iron', icon: 'flask', route: '/(tabs)/health/maternal/labscreeningiron' },
  { label: 'Supplements', icon: 'pill', iconFamily: 'MaterialCommunityIcons', route: '/(tabs)/health/maternal/supplements' },
  { label: 'Delivery Outcome', icon: 'baby-face-outline', iconFamily: 'MaterialCommunityIcons', route: '/(tabs)/health/maternal/deliveryoutcome' },
  { label: 'Postpartum Visit', icon: 'heart', route: '/(tabs)/health/maternal/postpartumvisit' },
];

const dummyChildren = [
  { id: 1, name: 'Juan Dela Cruz Jr.', age: 5 },
  { id: 2, name: 'Maria Dela Cruz', age: 2 },
];

const childOptions = [
  { label: 'Medical/Surgical', icon: 'medkit', route: 'medicalsurgical' },
  { label: 'Immunization', icon: 'shield-checkmark', route: 'immunization' },
  { label: 'Supplements', icon: 'pill', iconFamily: 'MaterialCommunityIcons', route: 'supplements' },
  { label: 'Growth Monitoring', icon: 'trending-up', route: 'growthmonitoring' },
];

const BUTTON_WIDTH = Math.round((Dimensions.get('window').width - 32) * 0.8);

export default function HealthRecordsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* ✅ General Health Section - NEW */}
      <View style={styles.sectionTitleContainer}>
        <MaterialCommunityIcons name="clipboard-pulse" size={26} color="#10b981" style={{ marginRight: 8 }} />
        <ThemedText style={styles.sectionTitleGeneralBig}>General Health</ThemedText>
      </View>
      <View style={styles.sectionCard}>
        <View style={styles.optionsGrid}>
          {generalHealthOptions.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.optionButton}
              onPress={() => router.push(opt.route as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#d1fae5' }]}>
                {opt.iconFamily === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons name={opt.icon as any} size={22} color="#10b981" />
                ) : (
                  <Ionicons name={opt.icon as any} size={22} color="#10b981" />
                )}
              </View>
              <ThemedText style={styles.optionLabelGeneral}>{opt.label}</ThemedText>
              <Ionicons name="chevron-forward" size={18} color="#10b981" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Maternal Section Title */}
      <View style={styles.sectionTitleContainer}>
        <MaterialCommunityIcons name="human-female" size={26} color="#FF3D33" style={{ marginRight: 8 }} />
        <ThemedText style={styles.sectionTitleMaternalBig}>Maternal Records</ThemedText>
      </View>
      <View style={styles.sectionCard}>
        <View style={styles.optionsGrid}>
          {maternalOptions.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.optionButton}
              onPress={() => router.push(opt.route as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#ffe4e1' }]}>
                {opt.iconFamily === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons name={opt.icon as any} size={22} color="#FF3D33" />
                ) : (
                  <Ionicons name={opt.icon as any} size={22} color="#FF3D33" />
                )}
              </View>
              <ThemedText style={styles.optionLabel}>{opt.label}</ThemedText>
              <Ionicons name="chevron-forward" size={18} color="#FF3D33" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Child Section Title */}
      <View style={styles.sectionTitleContainer}>
        <MaterialCommunityIcons name="baby-face-outline" size={26} color="#0ea5e9" style={{ marginRight: 8 }} />
        <ThemedText style={styles.sectionTitleChildBig}>Child Records</ThemedText>
      </View>
      <View style={styles.sectionCard}>
        {dummyChildren.map(child => (
          <View key={child.id} style={styles.childCard}>
            <View style={styles.childHeader}>
              <MaterialCommunityIcons name="account-child-circle" size={24} color="#38bdf8" style={{ marginRight: 10 }} />
              <ThemedText style={styles.childName}>{child.name}</ThemedText>
              <ThemedText style={styles.childAge}>({child.age} yrs)</ThemedText>
            </View>
            <View style={styles.optionsGrid}>
              {childOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={styles.optionButton}
                  onPress={() => router.push(`/(tabs)/health/child/${opt.route}?childId=${child.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
                    {opt.iconFamily === 'MaterialCommunityIcons' ? (
                      <MaterialCommunityIcons name={opt.icon as any} size={22} color="#0ea5e9" />
                    ) : (
                      <Ionicons name={opt.icon as any} size={22} color="#0ea5e9" />
                    )}
                  </View>
                  <ThemedText style={styles.optionLabelChild}>{opt.label}</ThemedText>
                  <Ionicons name="chevron-forward" size={18} color="#0ea5e9" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 2,
    marginLeft: 24,
  },
  // ✅ NEW: General Health Title Style
  sectionTitleGeneralBig: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  sectionTitleMaternalBig: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF3D33',
    letterSpacing: 0.5,
  },
  sectionTitleChildBig: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0ea5e9',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 18,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  optionsGrid: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: BUTTON_WIDTH,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  // ✅ NEW: General Health Label Style
  optionLabelGeneral: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 2,
    flexShrink: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: '#FF3D33',
    fontWeight: '600',
    marginLeft: 2,
    flexShrink: 1,
  },
  optionLabelChild: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
    marginLeft: 2,
    flexShrink: 1,
  },
  childCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 4,
  },
  childAge: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '400',
  },
});