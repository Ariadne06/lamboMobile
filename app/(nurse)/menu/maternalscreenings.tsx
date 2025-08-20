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

type ScreeningRecord = {
  id: string;
  diseaseType: 'Syphilis' | 'Hepatitis B' | 'HIV Screening';
  date: string;
  result: 'Negative' | 'Positive' | 'Pending';
  testedBy: string;
  notes?: string;
};

const screeningRecords: ScreeningRecord[] = [
  {
    id: '1',
    diseaseType: 'Syphilis',
    date: '2023-08-20',
    result: 'Negative',
    testedBy: 'Medical Laboratory Technician Ana Cruz',
    notes: 'Test done during first prenatal visit',
  },
  {
    id: '2',
    diseaseType: 'Hepatitis B',
    date: '2023-08-20',
    result: 'Negative',
    testedBy: 'Medical Laboratory Technician Ana Cruz',
    notes: 'HBsAg test negative',
  },
  {
    id: '3',
    diseaseType: 'HIV Screening',
    date: '2023-08-25',
    result: 'Negative',
    testedBy: 'Medical Laboratory Technician John Santos',
    notes: 'Routine HIV screening as part of prenatal care',
  },
  {
    id: '4',
    diseaseType: 'Syphilis',
    date: '2023-11-15',
    result: 'Negative',
    testedBy: 'Medical Laboratory Technician Maria Garcia',
    notes: 'Follow-up test during second trimester',
  },
];

const ScreeningCard = ({ record }: { record: ScreeningRecord }) => {
  const getResultColor = () => {
    switch (record.result) {
      case 'Negative': return '#10B981';
      case 'Positive': return '#EF4444';
      case 'Pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getDiseaseIcon = () => {
    switch (record.diseaseType) {
      case 'Syphilis': return 'search';
      case 'Hepatitis B': return 'shield';
      case 'HIV Screening': return 'medical';
      default: return 'search';
    }
  };

  return (
    <View style={styles.screeningCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={getDiseaseIcon() as any} size={24} color="#FF3D33" />
        </View>
        <View style={styles.screeningInfo}>
          <ThemedText type="defaultSemiBold" style={styles.diseaseType}>
            {record.diseaseType}
          </ThemedText>
          <ThemedText style={styles.screeningDate}>
            {new Date(record.date).toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.resultContainer}>
          <View style={[styles.resultDot, { backgroundColor: getResultColor() }]} />
          <ThemedText style={[styles.resultText, { color: getResultColor() }]}>
            {record.result}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText}>
            Tested by: {record.testedBy}
          </ThemedText>
        </View>
        {record.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#6B7280" />
            <ThemedText style={styles.detailText}>
              {record.notes}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

export default function MaternalScreenings() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);

  const renderScreening = ({ item }: { item: ScreeningRecord }) => (
    <ScreeningCard record={item} />
  );

  // Sort by date (newest first)
  const sortedRecords = [...screeningRecords].sort((a, b) => 
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
            Infectious Disease Screening
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {maternal.firstName} - {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={sortedRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderScreening}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No screening records found</ThemedText>
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
  screeningCard: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  screeningInfo: {
    flex: 1,
  },
  diseaseType: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  screeningDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
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