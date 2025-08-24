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

type DeliveryRecord = {
  id: string;
  outcome: 'Live Birth' | 'Stillbirth' | 'Miscarriage';
  deliveryDate: string;
  place: string;
  babySex: 'Male' | 'Female';
  weight: number; // in grams
  attendant: string;
  deliveryType: 'Normal Delivery' | 'Cesarean Section' | 'Assisted Delivery';
  complications?: string;
  notes?: string;
};

const deliveryRecords: DeliveryRecord[] = [
  {
    id: '1',
    outcome: 'Live Birth',
    deliveryDate: '2024-01-28',
    place: 'Barangay Health Station',
    babySex: 'Female',
    weight: 3200,
    attendant: 'Dr. Maria Santos, RMT',
    deliveryType: 'Normal Delivery',
    notes: 'Healthy baby girl. No complications during delivery. Mother and baby are in good condition.',
  },
  {
    id: '2',
    outcome: 'Live Birth',
    deliveryDate: '2023-12-15',
    place: 'Rural Health Unit',
    babySex: 'Male',
    weight: 2800,
    attendant: 'Midwife Ana Garcia',
    deliveryType: 'Normal Delivery',
    complications: 'Prolonged labor (12 hours)',
    notes: 'Baby boy born after prolonged labor. Both mother and baby are stable.',
  },
];

const DeliveryCard = ({ record }: { record: DeliveryRecord }) => {
  const getOutcomeColor = () => {
    switch (record.outcome) {
      case 'Live Birth': return '#10B981';
      case 'Stillbirth': return '#EF4444';
      case 'Miscarriage': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getDeliveryTypeColor = () => {
    switch (record.deliveryType) {
      case 'Normal Delivery': return '#10B981';
      case 'Cesarean Section': return '#F59E0B';
      case 'Assisted Delivery': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.deliveryCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="happy" size={24} color="#FF3D33" />
        </View>
        <View style={styles.deliveryInfo}>
          <ThemedText type="defaultSemiBold" style={styles.deliveryDate}>
            {new Date(record.deliveryDate).toLocaleDateString()}
          </ThemedText>
          <View style={styles.outcomeContainer}>
            <View style={[styles.outcomeDot, { backgroundColor: getOutcomeColor() }]} />
            <ThemedText style={styles.outcomeText}>
              {record.outcome}
            </ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.babyInfo}>
        <View style={styles.babyDetail}>
          <Ionicons name="male-female" size={16} color="#6B7280" />
          <ThemedText style={styles.babyText}>
            {record.babySex}
          </ThemedText>
        </View>
        <View style={styles.babyDetail}>
          <Ionicons name="scale" size={16} color="#6B7280" />
          <ThemedText style={styles.babyText}>
            {(record.weight / 1000).toFixed(2)} kg
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.deliveryDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText}>
            Place: {record.place}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText}>
            Attendant: {record.attendant}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <View style={[styles.typeDot, { backgroundColor: getDeliveryTypeColor() }]} />
          <ThemedText style={styles.detailText}>
            {record.deliveryType}
          </ThemedText>
        </View>
        {record.complications && (
          <View style={styles.detailRow}>
            <Ionicons name="warning-outline" size={16} color="#F59E0B" />
            <ThemedText style={styles.detailText}>
              Complications: {record.complications}
            </ThemedText>
          </View>
        )}
        {record.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text-outline" size={16} color="#6B7280" />
            <ThemedText style={styles.notesText}>
              {record.notes}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

export default function MaternalDeliveryOutcome() {
  const { maternalData } = useLocalSearchParams();
  const maternal = JSON.parse(maternalData as string);

  const renderDelivery = ({ item }: { item: DeliveryRecord }) => (
    <DeliveryCard record={item} />
  );

  // Sort by date (newest first)
  const sortedRecords = [...deliveryRecords].sort((a, b) => 
    new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime()
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
            Delivery Outcome
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {maternal.firstName} - {maternal.residentId}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={sortedRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderDelivery}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="happy-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No delivery records found</ThemedText>
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
  deliveryCard: {
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
  deliveryInfo: {
    flex: 1,
  },
  deliveryDate: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  outcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outcomeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  outcomeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  babyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  babyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  babyText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 6,
    fontWeight: '600',
  },
  deliveryDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
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