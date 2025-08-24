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

type ObstetricalRecord = {
  id: string;
  gravida: number;
  para: number;
  abortion: number;
  lastMenstrualPeriod: string;
  expectedDeliveryDate: string;
  recordDate: string;
  notes?: string;
};

const obstetricalRecords: ObstetricalRecord[] = [
  {
    id: '1',
    gravida: 3,
    para: 2,
    abortion: 0,
    lastMenstrualPeriod: '2023-07-20',
    expectedDeliveryDate: '2024-04-26',
    recordDate: '2023-08-15',
    notes: 'Previous pregnancies were normal with no complications',
  },
  {
    id: '2',
    gravida: 2,
    para: 1,
    abortion: 1,
    lastMenstrualPeriod: '2023-06-15',
    expectedDeliveryDate: '2024-03-22',
    recordDate: '2023-07-10',
    notes: 'One previous miscarriage at 8 weeks gestation',
  },
];

const ObstetricalCard = ({ record }: { record: ObstetricalRecord }) => (
  <View style={styles.recordCard}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}>
        <Ionicons name="medical" size={24} color="#FF3D33" />
      </View>
      <View style={styles.recordInfo}>
        <ThemedText type="defaultSemiBold" style={styles.recordDate}>
          {new Date(record.recordDate).toLocaleDateString()}
        </ThemedText>
        <ThemedText style={styles.recordSubtitle}>
          Obstetrical Assessment
        </ThemedText>
      </View>
    </View>
    
    <View style={styles.dataGrid}>
      <View style={styles.dataRow}>
        <View style={styles.dataItem}>
          <ThemedText style={styles.dataLabel}>Gravida</ThemedText>
          <ThemedText style={styles.dataValue}>{record.gravida}</ThemedText>
        </View>
        <View style={styles.dataItem}>
          <ThemedText style={styles.dataLabel}>Para</ThemedText>
          <ThemedText style={styles.dataValue}>{record.para}</ThemedText>
        </View>
        <View style={styles.dataItem}>
          <ThemedText style={styles.dataLabel}>Abortion</ThemedText>
          <ThemedText style={styles.dataValue}>{record.abortion}</ThemedText>
        </View>
      </View>
    </View>
    
    <View style={styles.dateInfo}>
      <View style={styles.dateItem}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <View style={styles.dateContent}>
          <ThemedText style={styles.dateLabel}>Last Menstrual Period</ThemedText>
          <ThemedText style={styles.dateValue}>
            {new Date(record.lastMenstrualPeriod).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>
      <View style={styles.dateItem}>
        <Ionicons name="calendar" size={16} color="#6B7280" />
        <View style={styles.dateContent}>
          <ThemedText style={styles.dateLabel}>Expected Delivery Date</ThemedText>
          <ThemedText style={styles.dateValue}>
            {new Date(record.expectedDeliveryDate).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>
    </View>
    
    {record.notes && (
      <View style={styles.notesContainer}>
        <Ionicons name="document-text-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.notesText}>
          {record.notes}
        </ThemedText>
      </View>
    )}
  </View>
);

export default function MaternalObstetrical() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);

  const renderRecord = ({ item }: { item: ObstetricalRecord }) => (
    <ObstetricalCard record={item} />
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
            Obstetrical History
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {maternal.firstName} - {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={obstetricalRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No obstetrical records found</ThemedText>
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
  recordCard: {
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
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  recordSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  dataGrid: {
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  dateInfo: {
    gap: 12,
    marginBottom: 16,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContent: {
    marginLeft: 8,
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
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