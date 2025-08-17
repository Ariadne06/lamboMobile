import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';

type MedicalCondition = {
  id: string;
  type: 'medical' | 'surgical';
  condition?: string;
  procedure?: string;
  date: string;
  notes: string;
  treatedBy: string;
  status: 'active' | 'resolved' | 'chronic';
};

const medicalHistory: MedicalCondition[] = [
  {
    id: '1',
    type: 'medical',
    condition: 'Mild Jaundice',
    date: '2023-06-18',
    notes: 'Neonatal jaundice observed on day 3. Phototherapy administered for 2 days. Bilirubin levels normalized.',
    treatedBy: 'Dr. Maria Santos',
    status: 'resolved',
  },
  {
    id: '2',
    type: 'medical',
    condition: 'Common Cold',
    date: '2023-09-20',
    notes: 'Runny nose and mild cough. No fever. Treated with supportive care.',
    treatedBy: 'Dr. John Reyes',
    status: 'resolved',
  },
  {
    id: '3',
    type: 'surgical',
    procedure: 'Circumcision',
    date: '2023-11-15',
    notes: 'Routine circumcision performed. No complications. Healing well.',
    treatedBy: 'Dr. Carlos Martinez',
    status: 'resolved',
  },
  {
    id: '4',
    type: 'medical',
    condition: 'Gastroenteritis',
    date: '2024-01-10',
    notes: 'Mild diarrhea and vomiting. Dehydration managed with oral rehydration. Recovery complete.',
    treatedBy: 'Dr. Ana Garcia',
    status: 'resolved',
  },
  {
    id: '5',
    type: 'medical',
    condition: 'Allergic Rhinitis',
    date: '2024-02-05',
    notes: 'Seasonal allergies with nasal congestion and sneezing. Managed with antihistamines.',
    treatedBy: 'Dr. Lisa Cruz',
    status: 'chronic',
  },
];

const MedicalCard = ({ record }: { record: MedicalCondition }) => {
  const getStatusColor = () => {
    switch (record.status) {
      case 'resolved': return '#10B981';
      case 'active': return '#F59E0B';
      case 'chronic': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = () => {
    return record.type === 'medical' ? 'medical' : 'cut';
  };

  return (
    <View style={styles.medicalCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={getTypeIcon() as any} size={24} color="#FF3D33" />
        </View>
        <View style={styles.conditionInfo}>
          <ThemedText type="defaultSemiBold" style={styles.conditionName}>
            {record.condition || record.procedure}
          </ThemedText>
          <ThemedText style={styles.conditionDate}>
            {new Date(record.date).toLocaleDateString()}
          </ThemedText>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <ThemedText style={styles.statusText}>
              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.typeContainer}>
          <ThemedText style={styles.typeText}>
            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.notesContainer}>
          <Ionicons name="document-text-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.notesText} numberOfLines={3}>
            {record.notes}
          </ThemedText>
        </View>
        <View style={styles.treatedByContainer}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.treatedByText}>
            Treated by: {record.treatedBy}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

export default function ChildMedicalHistory() {
  const { childData } = useLocalSearchParams();
  const child = JSON.parse(childData as string);
  const [filterType, setFilterType] = useState<'all' | 'medical' | 'surgical'>('all');

  const filteredHistory = React.useMemo(() => {
    if (filterType === 'all') return medicalHistory;
    return medicalHistory.filter(record => record.type === filterType);
  }, [filterType]);

  const renderMedicalRecord = ({ item }: { item: MedicalCondition }) => (
    <MedicalCard record={item} />
  );

  // Sort records by date (newest first)
  const sortedRecords = [...filteredHistory].sort((a, b) => 
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
            Medical/Surgical History
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {child.firstName} - {child.residentId}
          </ThemedText>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All Records' },
            { key: 'medical', label: 'Medical' },
            { key: 'surgical', label: 'Surgical' },
          ].map((filter) => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterButton,
                filterType === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilterType(filter.key as any)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  filterType === filter.key && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Medical History List */}
      <FlatList
        data={sortedRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderMedicalRecord}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No medical records found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              No {filterType === 'all' ? '' : filterType} records available
            </ThemedText>
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
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FF3D33',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
  },
  medicalCard: {
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  conditionDate: {
    fontSize: 12,
    color: '#6B7280',
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
  typeContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  cardDetails: {
    gap: 8,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  treatedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  treatedByText: {
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
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
});