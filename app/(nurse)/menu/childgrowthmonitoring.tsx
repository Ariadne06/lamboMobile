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

type GrowthRecord = {
  id: string;
  date: string;
  ageMonths: number;
  height: number;
  weight: number;
  temperature: number;
  note: string;
  measuredBy: string;
};

const growthData: GrowthRecord[] = [
  {
    id: '1',
    date: '2023-06-15',
    ageMonths: 0,
    height: 48.5,
    weight: 3.2,
    temperature: 36.5,
    note: 'Birth measurements - Normal',
    measuredBy: 'Dr. Maria Santos',
  },
  {
    id: '2',
    date: '2023-07-15',
    ageMonths: 1,
    height: 52.0,
    weight: 4.1,
    temperature: 36.8,
    note: 'Good weight gain',
    measuredBy: 'Nurse Ana Garcia',
  },
  {
    id: '3',
    date: '2023-08-15',
    ageMonths: 2,
    height: 55.2,
    weight: 4.9,
    temperature: 36.6,
    note: 'Excellent growth progression',
    measuredBy: 'Nurse Ana Garcia',
  },
  {
    id: '4',
    date: '2023-09-15',
    ageMonths: 3,
    height: 58.1,
    weight: 5.8,
    temperature: 36.7,
    note: 'Meeting all milestones',
    measuredBy: 'Dr. Maria Santos',
  },
  {
    id: '5',
    date: '2023-12-15',
    ageMonths: 6,
    height: 65.5,
    weight: 7.2,
    temperature: 36.5,
    note: 'Started solid foods',
    measuredBy: 'Nurse John Dela Cruz',
  },
  {
    id: '6',
    date: '2024-02-15',
    ageMonths: 8,
    height: 69.8,
    weight: 8.1,
    temperature: 36.8,
    note: 'Active and healthy',
    measuredBy: 'Nurse Ana Garcia',
  },
];

const GrowthCard = ({ growth }: { growth: GrowthRecord }) => (
  <View style={styles.growthCard}>
    <View style={styles.cardHeader}>
      <View style={styles.dateContainer}>
        <ThemedText style={styles.dateText}>
          {new Date(growth.date).toLocaleDateString()}
        </ThemedText>
        <ThemedText style={styles.ageText}>{growth.ageMonths} months</ThemedText>
      </View>
      <View style={styles.measurementsContainer}>
        <View style={styles.measurementItem}>
          <Ionicons name="resize" size={16} color="#FF3D33" />
          <ThemedText style={styles.measurementValue}>{growth.height} cm</ThemedText>
        </View>
        <View style={styles.measurementItem}>
          <Ionicons name="fitness" size={16} color="#10B981" />
          <ThemedText style={styles.measurementValue}>{growth.weight} kg</ThemedText>
        </View>
        <View style={styles.measurementItem}>
          <Ionicons name="thermometer" size={16} color="#F59E0B" />
          <ThemedText style={styles.measurementValue}>{growth.temperature}°C</ThemedText>
        </View>
      </View>
    </View>
    
    <View style={styles.cardDetails}>
      <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>Measured by:</ThemedText>
        <ThemedText style={styles.detailValue}>{growth.measuredBy}</ThemedText>
      </View>
      <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>Note:</ThemedText>
        <ThemedText style={styles.detailValue}>{growth.note}</ThemedText>
      </View>
    </View>
  </View>
);

export default function ChildGrowthMonitoring() {
  const { childData } = useLocalSearchParams();
  const child = JSON.parse(childData as string);

  const latestGrowth = growthData[growthData.length - 1];

  const renderGrowth = ({ item }: { item: GrowthRecord }) => (
    <GrowthCard growth={item} />
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
            Growth Monitoring
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {child.firstName} - {child.residentId}
          </ThemedText>
        </View>
      </View>

      {/* Latest Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="resize" size={24} color="#FF3D33" />
          <View style={styles.statInfo}>
            <ThemedText style={styles.statValue}>{latestGrowth.height} cm</ThemedText>
            <ThemedText style={styles.statLabel}>Height</ThemedText>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="fitness" size={24} color="#10B981" />
          <View style={styles.statInfo}>
            <ThemedText style={styles.statValue}>{latestGrowth.weight} kg</ThemedText>
            <ThemedText style={styles.statLabel}>Weight</ThemedText>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#6366F1" />
          <View style={styles.statInfo}>
            <ThemedText style={styles.statValue}>{latestGrowth.ageMonths}m</ThemedText>
            <ThemedText style={styles.statLabel}>Age</ThemedText>
          </View>
        </View>
      </View>

      {/* Growth History */}
      <FlatList
        data={growthData.reverse()}
        keyExtractor={(item) => item.id}
        renderItem={renderGrowth}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="trending-up" size={20} color="#FF3D33" />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Growth History
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  statInfo: {
    marginLeft: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
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
  growthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    marginBottom: 12,
  },
  dateContainer: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ageText: {
    fontSize: 12,
    color: '#6B7280',
  },
  measurementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 6,
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