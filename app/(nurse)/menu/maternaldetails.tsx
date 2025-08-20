import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';

const DetailRow = ({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) => (
  <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
    <ThemedText style={styles.detailLabel}>{label}</ThemedText>
    <ThemedText style={styles.detailValue} numberOfLines={2}>
      {value}
    </ThemedText>
  </View>
);

const MenuButton = ({ 
  icon, 
  title, 
  subtitle, 
  onPress 
}: { 
  icon: string; 
  title: string; 
  subtitle: string; 
  onPress: () => void;
}) => (
  <Pressable style={styles.menuButton} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Ionicons name={icon as any} size={24} color="#FF3D33" />
    </View>
    <View style={styles.menuContent}>
      <ThemedText type="defaultSemiBold" style={styles.menuTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.menuSubtitle}>
        {subtitle}
      </ThemedText>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </Pressable>
);

export default function MaternalDetails() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);

  const navigateToMedicalSurgical = () => {
    router.push({
      pathname: '/(nurse)/menu/maternalmedicalsurgical',
      params: { maternalData: JSON.stringify(maternal) }
    });
  };

  const navigateToImmunization = () => {
    router.push({
      pathname: '/(nurse)/menu/maternalimmunization',
      params: { maternalData: JSON.stringify(maternal) }
    });
  };

  const navigateToObstetrical = () => {
    router.push({
      pathname: '/(nurse)/menu/maternalobstetrical',
      params: { maternalData: JSON.stringify(maternal) }
    });
  };

  const navigateToCheckups = () => {
    router.push({
      pathname: '/(nurse)/menu/maternalcheckups',
      params: { maternalData: JSON.stringify(maternal) }
    });
  };

  const navigateToScreenings = () => {
    router.push({
      pathname: '/(nurse)/menu/maternalscreenings',
      params: { maternalData: JSON.stringify(maternal) }
    });
  };

  const navigateToLabScreening = () => {
    router.push({
      pathname: '/(nurse)/menu/maternallabscreening',
      params: { maternalData: JSON.stringify(maternal) }
    });
  };

  const navigateToSupplements = () => {
    router.push({
      pathname: '/(nurse)/menu/maternalsupplements',
      params: { maternalData: JSON.stringify(maternal) }
    });
  };

  const navigateToDeliveryOutcome = () => {
    router.push({
      pathname: '/(nurse)/menu/maternaldeliveryoutcome',
      params: { maternalData: JSON.stringify(maternal) }
    });
  };

  const navigateToPostpartum = () => {
    router.push({
      pathname: '/(nurse)/menu/maternalpostpartum',
      params: { maternalData: JSON.stringify(maternal) }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.headerTitle}>
            {maternal.firstName}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            ID: {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="person" size={20} color="#FF3D33" />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Basic Information
            </ThemedText>
          </View>
          <View style={styles.sectionContent}>
            <DetailRow label="Full Name" value={maternal.fullName} />
            <DetailRow label="Resident ID" value={maternal.residentId} />
            <DetailRow label="Registration Date" value={new Date(maternal.registrationDate).toLocaleDateString()} />
            <DetailRow label="NHTS Status" value={maternal.nhtsStatus.charAt(0).toUpperCase() + maternal.nhtsStatus.slice(1)} />
            <DetailRow label="Address" value={maternal.address} />
            <DetailRow label="Contact Number" value={maternal.contactNumber} />
            <DetailRow label="Age" value={maternal.age.toString()} />
            <DetailRow label="Status" value={maternal.status.charAt(0).toUpperCase() + maternal.status.slice(1)} />
            {maternal.expectedDeliveryDate && (
              <DetailRow label="Expected Delivery Date" value={new Date(maternal.expectedDeliveryDate).toLocaleDateString()} />
            )}
            {maternal.gestationalAge && (
              <DetailRow label="Gestational Age" value={`${maternal.gestationalAge} weeks`} />
            )}
            <DetailRow label="Recorded By" value={maternal.recordedBy} isLast />
          </View>
        </View>

        {/* Maternal Health Records Menu */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="folder-open" size={20} color="#FF3D33" />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Maternal Health Records
            </ThemedText>
          </View>
          <View style={styles.menuContainer}>
            <MenuButton
              icon="documents"
              title="Medical/Surgical History"
              subtitle="Medical conditions and procedures"
              onPress={navigateToMedicalSurgical}
            />
            <MenuButton
              icon="shield-checkmark"
              title="Immunization"
              subtitle="Vaccination records and schedule"
              onPress={navigateToImmunization}
            />
            <MenuButton
              icon="medical"
              title="Obstetrical History"
              subtitle="Previous pregnancies and outcomes"
              onPress={navigateToObstetrical}
            />
            <MenuButton
              icon="heart"
              title="Check-ups"
              subtitle="Prenatal and routine check-ups"
              onPress={navigateToCheckups}
            />
            <MenuButton
              icon="search"
              title="Screenings"
              subtitle="Health screenings and tests"
              onPress={navigateToScreenings}
            />
            <MenuButton
              icon="flask"
              title="Lab Screening + Iron"
              subtitle="Laboratory tests and iron supplementation"
              onPress={navigateToLabScreening}
            />
            <MenuButton
              icon="nutrition"
              title="Supplements"
              subtitle="Vitamin and mineral supplements"
              onPress={navigateToSupplements}
            />
            <MenuButton
              icon="happy"
              title="Delivery Outcome"
              subtitle="Birth and delivery information"
              onPress={navigateToDeliveryOutcome}
            />
            <MenuButton
              icon="time"
              title="Postpartum Visit"
              subtitle="Post-delivery care and follow-up"
              onPress={navigateToPostpartum}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginLeft: 10,
    fontWeight: '600',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});