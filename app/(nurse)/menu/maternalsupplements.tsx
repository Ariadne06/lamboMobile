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

type SupplementRecord = {
  id: string;
  type: string;
  date: string;
  quantity: string;
  trimester: 'First' | 'Second' | 'Third';
  givenBy: string;
  notes?: string;
};

const supplementRecords: SupplementRecord[] = [
  {
    id: '1',
    type: 'Folic Acid',
    date: '2023-08-15',
    quantity: '30 tablets',
    trimester: 'First',
    givenBy: 'Nurse Ana Garcia',
    notes: 'Take 1 tablet daily with food',
  },
  {
    id: '2',
    type: 'Iron + Folic Acid',
    date: '2023-09-15',
    quantity: '60 tablets',
    trimester: 'First',
    givenBy: 'Nurse Maria Santos',
    notes: 'Take 1 tablet daily. May cause stomach upset if taken on empty stomach',
  },
  {
    id: '3',
    type: 'Calcium Carbonate',
    date: '2023-11-20',
    quantity: '90 tablets',
    trimester: 'Second',
    givenBy: 'Dr. Carlos Martinez',
    notes: 'Take 1 tablet twice daily with meals',
  },
  {
    id: '4',
    type: 'Iron + Folic Acid',
    date: '2023-12-15',
    quantity: '60 tablets',
    trimester: 'Second',
    givenBy: 'Nurse Lisa Cruz',
    notes: 'Continue taking daily. Hemoglobin levels improving',
  },
  {
    id: '5',
    type: 'Multivitamins (Prenatal)',
    date: '2024-01-10',
    quantity: '30 tablets',
    trimester: 'Third',
    givenBy: 'Dr. Maria Santos',
    notes: 'Complete prenatal vitamin. Take 1 tablet daily',
  },
  {
    id: '6',
    type: 'Iron + Folic Acid',
    date: '2024-02-10',
    quantity: '60 tablets',
    trimester: 'Third',
    givenBy: 'Nurse Ana Garcia',
    notes: 'Continue until delivery and postpartum period',
  },
];

const SupplementCard = ({ record }: { record: SupplementRecord }) => {
  const getTrimesterColor = () => {
    switch (record.trimester) {
      case 'First': return '#3B82F6';
      case 'Second': return '#10B981';
      case 'Third': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getSupplementIcon = () => {
    if (record.type.toLowerCase().includes('iron')) return 'fitness';
    if (record.type.toLowerCase().includes('calcium')) return 'medical';
    if (record.type.toLowerCase().includes('folic')) return 'leaf';
    if (record.type.toLowerCase().includes('vitamin')) return 'nutrition';
    return 'nutrition';
  };

  return (
    <View style={styles.supplementCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={getSupplementIcon() as any} size={24} color="#FF3D33" />
        </View>
        <View style={styles.supplementInfo}>
          <ThemedText type="defaultSemiBold" style={styles.supplementType}>
            {record.type}
          </ThemedText>
          <View style={styles.trimesterContainer}>
            <View style={[styles.trimesterDot, { backgroundColor: getTrimesterColor() }]} />
            <ThemedText style={styles.trimesterText}>
              {record.trimester} Trimester
            </ThemedText>
          </View>
        </View>
        <View style={styles.quantityContainer}>
          <ThemedText style={styles.quantityText}>{record.quantity}</ThemedText>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText}>
            Given on: {new Date(record.date).toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText}>
            Given by: {record.givenBy}
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

export default function MaternalSupplements() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);

  const renderSupplement = ({ item }: { item: SupplementRecord }) => (
    <SupplementCard record={item} />
  );

  // Sort by date (newest first)
  const sortedRecords = [...supplementRecords].sort((a, b) => 
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
            Supplements
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {maternal.firstName} - {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={sortedRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderSupplement}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="nutrition-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No supplement records found</ThemedText>
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
  supplementCard: {
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
  supplementInfo: {
    flex: 1,
  },
  supplementType: {
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
  quantityContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quantityText: {
    fontSize: 12,
    color: '#1F2937',
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