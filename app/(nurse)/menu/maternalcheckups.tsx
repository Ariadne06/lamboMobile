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

type CheckupRecord = {
  id: string;
  trimester: 'First' | 'Second' | 'Third';
  date: string;
  aog: number; // Age of Gestation in weeks
  height: number; // in cm
  weight: number; // in kg
  bloodPressure: string;
  notes: string;
  checkedBy: string;
};

const checkupRecords: CheckupRecord[] = [
  {
    id: '1',
    trimester: 'First',
    date: '2023-08-15',
    aog: 8,
    height: 158,
    weight: 52,
    bloodPressure: '110/70',
    notes: 'First prenatal visit. Patient is in good health with no complaints.',
    checkedBy: 'Dr. Maria Santos',
  },
  {
    id: '2',
    trimester: 'First',
    date: '2023-09-20',
    aog: 12,
    height: 158,
    weight: 53.5,
    bloodPressure: '115/75',
    notes: 'Weight gain is appropriate. Vital signs normal.',
    checkedBy: 'Nurse Ana Garcia',
  },
  {
    id: '3',
    trimester: 'Second',
    date: '2023-11-15',
    aog: 20,
    height: 158,
    weight: 56,
    bloodPressure: '120/80',
    notes: 'Fetal movement felt. Ultrasound scheduled. Blood pressure slightly elevated.',
    checkedBy: 'Dr. Carlos Martinez',
  },
  {
    id: '4',
    trimester: 'Second',
    date: '2023-12-20',
    aog: 24,
    height: 158,
    weight: 58.5,
    bloodPressure: '118/78',
    notes: 'Glucose screening test done. Results normal.',
    checkedBy: 'Dr. Maria Santos',
  },
  {
    id: '5',
    trimester: 'Third',
    date: '2024-01-25',
    aog: 28,
    height: 158,
    weight: 61,
    bloodPressure: '125/82',
    notes: 'Baby position is vertex. Preparing for delivery.',
    checkedBy: 'Dr. Lisa Cruz',
  },
];

const CheckupCard = ({ record }: { record: CheckupRecord }) => {
  const getTrimesterColor = () => {
    switch (record.trimester) {
      case 'First': return '#3B82F6';
      case 'Second': return '#10B981';
      case 'Third': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.checkupCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="heart" size={24} color="#FF3D33" />
        </View>
        <View style={styles.checkupInfo}>
          <ThemedText type="defaultSemiBold" style={styles.checkupDate}>
            {new Date(record.date).toLocaleDateString()}
          </ThemedText>
          <View style={styles.trimesterContainer}>
            <View style={[styles.trimesterDot, { backgroundColor: getTrimesterColor() }]} />
            <ThemedText style={styles.trimesterText}>
              {record.trimester} Trimester - {record.aog} weeks AOG
            </ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.vitalsContainer}>
        <View style={styles.vitalItem}>
          <View style={styles.vitalIconContainer}>
            <Ionicons name="resize" size={16} color="#3B82F6" />
          </View>
          <View>
            <ThemedText style={styles.vitalLabel}>Height</ThemedText>
            <ThemedText style={styles.vitalValue}>{record.height} cm</ThemedText>
          </View>
        </View>
        
        <View style={styles.vitalItem}>
          <View style={styles.vitalIconContainer}>
            <Ionicons name="scale" size={16} color="#10B981" />
          </View>
          <View>
            <ThemedText style={styles.vitalLabel}>Weight</ThemedText>
            <ThemedText style={styles.vitalValue}>{record.weight} kg</ThemedText>
          </View>
        </View>
        
        <View style={styles.vitalItem}>
          <View style={styles.vitalIconContainer}>
            <Ionicons name="pulse" size={16} color="#EF4444" />
          </View>
          <View>
            <ThemedText style={styles.vitalLabel}>BP</ThemedText>
            <ThemedText style={styles.vitalValue}>{record.bloodPressure}</ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.notesContainer}>
        <Ionicons name="document-text-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.notesText} numberOfLines={2}>
          {record.notes}
        </ThemedText>
      </View>
      
      <View style={styles.checkedByContainer}>
        <Ionicons name="person-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.checkedByText}>
          Checked by: {record.checkedBy}
        </ThemedText>
      </View>
    </View>
  );
};

export default function MaternalCheckups() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);

  const renderCheckup = ({ item }: { item: CheckupRecord }) => (
    <CheckupCard record={item} />
  );

  // Sort by date (newest first)
  const sortedRecords = [...checkupRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
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
            Check-ups
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {maternal.firstName} - {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={sortedRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderCheckup}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No check-up records found</ThemedText>
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
  checkupCard: {
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
  checkupInfo: {
    flex: 1,
  },
  checkupDate: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  trimesterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trimesterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  trimesterText: {
    fontSize: 12,
    color: '#6B7280',
  },
  vitalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vitalItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  vitalIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  vitalLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  checkedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkedByText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
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