import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';

type ImmunizationRecord = {
  id: string;
  vaccine: string;
  firstDose?: string;
  secondDose?: string;
  thirdDose?: string;
  fourthDose?: string;
  fifthDose?: string;
  fimStatus: 'complete' | 'incomplete' | 'not-started';
};

const immunizationRecords: ImmunizationRecord[] = [
  {
    id: '1',
    vaccine: 'Tetanus Toxoid (TT)',
    firstDose: '2023-08-15',
    secondDose: '2023-09-15',
    thirdDose: '2023-10-15',
    fourthDose: '2023-11-15',
    fifthDose: '2023-12-15',
    fimStatus: 'complete',
  },
  {
    id: '2',
    vaccine: 'Influenza',
    firstDose: '2023-09-01',
    secondDose: '2024-01-01',
    fimStatus: 'complete',
  },
  {
    id: '3',
    vaccine: 'COVID-19',
    firstDose: '2023-08-20',
    secondDose: '2023-09-20',
    thirdDose: '2024-01-20',
    fimStatus: 'complete',
  },
  {
    id: '4',
    vaccine: 'Hepatitis B',
    firstDose: '2023-08-10',
    secondDose: '2023-09-10',
    fimStatus: 'incomplete',
  },
];

const ImmunizationCard = ({ record }: { record: ImmunizationRecord }) => {
  const getStatusColor = () => {
    switch (record.fimStatus) {
      case 'complete': return '#10B981';
      case 'incomplete': return '#F59E0B';
      case 'not-started': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const doses = [
    { label: '1st Dose', date: record.firstDose },
    { label: '2nd Dose', date: record.secondDose },
    { label: '3rd Dose', date: record.thirdDose },
    { label: '4th Dose', date: record.fourthDose },
    { label: '5th Dose', date: record.fifthDose },
  ].filter(dose => dose.date);

  return (
    <View style={styles.immunizationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={24} color="#FF3D33" />
        </View>
        <View style={styles.vaccineInfo}>
          <ThemedText type="defaultSemiBold" style={styles.vaccineName}>
            {record.vaccine}
          </ThemedText>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <ThemedText style={styles.statusText}>
              FIM Status: {record.fimStatus.charAt(0).toUpperCase() + record.fimStatus.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.dosesContainer}>
        {doses.map((dose, index) => (
          <View key={index} style={styles.doseItem}>
            <View style={styles.doseIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            </View>
            <View style={styles.doseInfo}>
              <ThemedText style={styles.doseLabel}>{dose.label}</ThemedText>
              <ThemedText style={styles.doseDate}>
                {new Date(dose.date!).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function MaternalImmunization() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);

  const renderImmunization = ({ item }: { item: ImmunizationRecord }) => (
    <ImmunizationCard record={item} />
  );

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
            {maternal.firstName} - {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={immunizationRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderImmunization}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No immunization records found</ThemedText>
          </View>
        }
      />
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
  listContainer: {
    padding: 20,
  },
  immunizationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  dosesContainer: {
    gap: 8,
  },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  doseIndicator: {
    marginRight: 12,
  },
  doseInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doseLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  doseDate: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginTop: 16,
    fontWeight: '600',
  },
});