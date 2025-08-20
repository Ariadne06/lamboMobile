import React from 'react';
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

type SupplementRecord = {
  id: string;
  type: string;
  date: string;
  age: number;
  givenBy: string;
  dosage?: string;
  notes?: string;
};

const supplementData: SupplementRecord[] = [
  {
    id: '1',
    type: 'Vitamin A',
    date: '2023-06-15',
    age: 0,
    givenBy: 'Nurse Maria Santos',
    dosage: '50,000 IU',
    notes: 'Given at birth',
  },
  {
    id: '2',
    type: 'Iron Drops',
    date: '2023-08-15',
    age: 2,
    givenBy: 'Nurse John Dela Cruz',
    dosage: '2.5ml daily',
    notes: 'Start iron supplementation',
  },
  {
    id: '3',
    type: 'Vitamin A',
    date: '2023-12-15',
    age: 6,
    givenBy: 'Nurse Maria Santos',
    dosage: '100,000 IU',
    notes: '6-month dose',
  },
  {
    id: '4',
    type: 'Vitamin D',
    date: '2024-01-15',
    age: 7,
    givenBy: 'Nurse Ana Garcia',
    dosage: '400 IU daily',
    notes: 'Winter supplementation',
  },
  {
    id: '5',
    type: 'Iron Drops',
    date: '2024-02-15',
    age: 8,
    givenBy: 'Nurse John Dela Cruz',
    dosage: '2.5ml daily',
    notes: 'Continue iron therapy',
  },
];

const SupplementCard = ({ supplement }: { supplement: SupplementRecord }) => (
  <View style={styles.supplementCard}>
    <View style={styles.cardHeader}>
      <View style={styles.supplementIconContainer}>
        <Ionicons name="nutrition" size={20} color="#FF3D33" />
      </View>
      <View style={styles.cardInfo}>
        <ThemedText type="defaultSemiBold" style={styles.supplementType}>
          {supplement.type}
        </ThemedText>
        <ThemedText style={styles.supplementDate}>
          {new Date(supplement.date).toLocaleDateString()}
        </ThemedText>
      </View>
      <View style={styles.ageContainer}>
        <ThemedText style={styles.ageText}>{supplement.age}m</ThemedText>
      </View>
    </View>
    
    <View style={styles.cardDetails}>
      <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>Dosage:</ThemedText>
        <ThemedText style={styles.detailValue}>{supplement.dosage || 'N/A'}</ThemedText>
      </View>
      <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>Given by:</ThemedText>
        <ThemedText style={styles.detailValue}>{supplement.givenBy}</ThemedText>
      </View>
      {supplement.notes && (
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Notes:</ThemedText>
          <ThemedText style={styles.detailValue}>{supplement.notes}</ThemedText>
        </View>
      )}
    </View>
  </View>
);

export default function ChildSupplements() {
  const { childData } = useLocalSearchParams();
  const child = JSON.parse(childData as string);

  const renderSupplement = ({ item }: { item: SupplementRecord }) => (
    <SupplementCard supplement={item} />
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
            {child.firstName} - {child.residentId}
          </ThemedText>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="nutrition" size={24} color="#FF3D33" />
          <View style={styles.summaryInfo}>
            <ThemedText style={styles.summaryCount}>{supplementData.length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Supplements</ThemedText>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="calendar" size={24} color="#10B981" />
          <View style={styles.summaryInfo}>
            <ThemedText style={styles.summaryCount}>
              {new Set(supplementData.map(s => s.type)).size}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Types Given</ThemedText>
          </View>
        </View>
      </View>

      {/* Supplements List */}
      <FlatList
        data={supplementData}
        keyExtractor={(item) => item.id}
        renderItem={renderSupplement}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="list" size={20} color="#FF3D33" />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Supplement History
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  summaryInfo: {
    marginLeft: 12,
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContainer: {
    padding: 20,
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
  supplementCard: {
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
  },
  supplementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  supplementType: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  supplementDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  ageContainer: {
    backgroundColor: '#FF3D33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ageText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
});