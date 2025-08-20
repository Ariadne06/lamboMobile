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

type ImmunizationRecord = {
  vaccine: string;
  atBirth?: string;
  firstDose?: string;
  secondDose?: string;
  thirdDose?: string;
  booster?: string;
};

const immunizationData: ImmunizationRecord[] = [
  {
    vaccine: 'BCG',
    atBirth: '2023-06-15',
  },
  {
    vaccine: 'Hepatitis B',
    atBirth: '2023-06-15',
    firstDose: '2023-07-15',
    secondDose: '2023-08-15',
    thirdDose: '2023-09-15',
  },
  {
    vaccine: 'DPT-HepB-Hib',
    firstDose: '2023-08-15',
    secondDose: '2023-09-15',
    thirdDose: '2023-10-15',
  },
  {
    vaccine: 'OPV',
    firstDose: '2023-08-15',
    secondDose: '2023-09-15',
    thirdDose: '2023-10-15',
  },
  {
    vaccine: 'IPV',
    firstDose: '2023-08-15',
    secondDose: '2023-10-15',
  },
  {
    vaccine: 'PCV',
    firstDose: '2023-08-15',
    secondDose: '2023-09-15',
    thirdDose: '2023-10-15',
  },
  {
    vaccine: 'MMR',
    firstDose: '2024-06-15',
  },
];

const ImmunizationCard = ({ record }: { record: ImmunizationRecord }) => (
  <View style={styles.immunizationCard}>
    <View style={styles.cardHeader}>
      <View style={styles.vaccineIconContainer}>
        <Ionicons name="shield-checkmark" size={20} color="#FF3D33" />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.vaccineName}>
        {record.vaccine}
      </ThemedText>
    </View>
    
    <View style={styles.doseContainer}>
      {record.atBirth && (
        <View style={styles.doseItem}>
          <ThemedText style={styles.doseLabel}>At Birth:</ThemedText>
          <ThemedText style={styles.doseValue}>
            {new Date(record.atBirth).toLocaleDateString()}
          </ThemedText>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
        </View>
      )}
      
      {record.firstDose && (
        <View style={styles.doseItem}>
          <ThemedText style={styles.doseLabel}>1st Dose:</ThemedText>
          <ThemedText style={styles.doseValue}>
            {new Date(record.firstDose).toLocaleDateString()}
          </ThemedText>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
        </View>
      )}
      
      {record.secondDose && (
        <View style={styles.doseItem}>
          <ThemedText style={styles.doseLabel}>2nd Dose:</ThemedText>
          <ThemedText style={styles.doseValue}>
            {new Date(record.secondDose).toLocaleDateString()}
          </ThemedText>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
        </View>
      )}
      
      {record.thirdDose && (
        <View style={styles.doseItem}>
          <ThemedText style={styles.doseLabel}>3rd Dose:</ThemedText>
          <ThemedText style={styles.doseValue}>
            {new Date(record.thirdDose).toLocaleDateString()}
          </ThemedText>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
        </View>
      )}
      
      {record.booster && (
        <View style={styles.doseItem}>
          <ThemedText style={styles.doseLabel}>Booster:</ThemedText>
          <ThemedText style={styles.doseValue}>
            {new Date(record.booster).toLocaleDateString()}
          </ThemedText>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
        </View>
      )}
    </View>
  </View>
);

export default function ChildImmunization() {
  const { childData } = useLocalSearchParams();
  const child = JSON.parse(childData as string);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.headerTitle}>
            Immunization Records
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {child.firstName} - {child.residentId}
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="shield-checkmark" size={20} color="#FF3D33" />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Vaccination History
            </ThemedText>
          </View>
          
          {immunizationData.map((record, index) => (
            <ImmunizationCard key={index} record={record} />
          ))}
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginLeft: 10,
    fontWeight: '600',
  },
  immunizationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  vaccineIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vaccineName: {
    fontSize: 16,
    color: '#1F2937',
  },
  doseContainer: {
    gap: 8,
  },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  doseLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  doseValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
});