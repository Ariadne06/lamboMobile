import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';

type MaternalRecord = {
  id: string;
  residentId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  registrationDate: string;
  nhtsStatus: 'member' | 'non-member' | 'pending';
  address: string;
  contactNumber: string;
  status: 'pregnant' | 'postpartum' | 'non-pregnant';
  recordedBy: string;
  age: number;
  expectedDeliveryDate?: string;
  gestationalAge?: number;
};

// Sample maternal records
const maternalRecords: MaternalRecord[] = [
  {
    id: '1',
    residentId: 'R-0025',
    fullName: 'Maria Santos Cruz',
    firstName: 'Maria',
    lastName: 'Cruz',
    registrationDate: '2023-08-15',
    nhtsStatus: 'member',
    address: 'Purok 3, Barangay Poblacion',
    contactNumber: '+63-912-345-6789',
    status: 'pregnant',
    recordedBy: 'Nurse Ana Garcia',
    age: 28,
    expectedDeliveryDate: '2024-04-20',
    gestationalAge: 32,
  },
  {
    id: '2',
    residentId: 'R-0026',
    fullName: 'Carmen Rose Villarta',
    firstName: 'Carmen',
    lastName: 'Villarta',
    registrationDate: '2023-12-10',
    nhtsStatus: 'member',
    address: 'Sitio Malinao, Barangay Tayud',
    contactNumber: '+63-917-234-5678',
    status: 'postpartum',
    recordedBy: 'Nurse Lisa Reyes',
    age: 25,
    expectedDeliveryDate: '2024-01-15',
  },
  {
    id: '3',
    residentId: 'R-0027',
    fullName: 'Anna Marie Lopez',
    firstName: 'Anna Marie',
    lastName: 'Lopez',
    registrationDate: '2024-01-20',
    nhtsStatus: 'pending',
    address: 'Purok 5, Barangay Poblacion',
    contactNumber: '+63-920-456-7890',
    status: 'pregnant',
    recordedBy: 'Nurse John Cruz',
    age: 32,
    expectedDeliveryDate: '2024-06-10',
    gestationalAge: 16,
  },
  {
    id: '4',
    residentId: 'R-0028',
    fullName: 'Grace Elena Morales',
    firstName: 'Grace',
    lastName: 'Morales',
    registrationDate: '2023-09-05',
    nhtsStatus: 'non-member',
    address: 'Sitio Lubi, Barangay Garing',
    contactNumber: '+63-918-567-8901',
    status: 'pregnant',
    recordedBy: 'Dr. Carlos Martinez',
    age: 29,
    expectedDeliveryDate: '2024-03-25',
    gestationalAge: 28,
  },
  {
    id: '5',
    residentId: 'R-0029',
    fullName: 'Isabella Rose Garcia',
    firstName: 'Isabella',
    lastName: 'Garcia',
    registrationDate: '2023-11-30',
    nhtsStatus: 'member',
    address: 'Purok 7, Barangay Poblacion',
    contactNumber: '+63-919-678-9012',
    status: 'postpartum',
    recordedBy: 'Nurse Maria Santos',
    age: 26,
  },
];

const MaternalCard = ({ record, onPress }: { record: MaternalRecord; onPress: () => void }) => {
  const getStatusColor = () => {
    switch (record.status) {
      case 'pregnant': return '#3B82F6';
      case 'postpartum': return '#10B981';
      case 'non-pregnant': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getNhtsColor = () => {
    switch (record.nhtsStatus) {
      case 'member': return '#10B981';
      case 'non-member': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <Pressable style={styles.maternalCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardInfo}>
          <ThemedText type="defaultSemiBold" style={styles.patientName}>
            {record.fullName}
          </ThemedText>
          <ThemedText style={styles.residentId}>ID: {record.residentId}</ThemedText>
          <View style={styles.statusRow}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <ThemedText style={styles.statusText}>
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </ThemedText>
            </View>
            <View style={styles.nhtsContainer}>
              <View style={[styles.statusDot, { backgroundColor: getNhtsColor() }]} />
              <ThemedText style={styles.statusText}>
                NHTS: {record.nhtsStatus}
              </ThemedText>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText}>
            Age: {record.age}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText} numberOfLines={1}>
            {record.address}
          </ThemedText>
        </View>
        {record.gestationalAge && (
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <ThemedText style={styles.detailText}>
              {record.gestationalAge} weeks
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default function MaternalRecord() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pregnant' | 'postpartum' | 'non-pregnant'>('all');

  const filteredRecords = React.useMemo(() => {
    let filtered = maternalRecords;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }
    
    // Filter by search query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(record =>
        record.fullName.toLowerCase().includes(query) ||
        record.residentId.toLowerCase().includes(query) ||
        record.address.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [searchQuery, filterStatus]);

  const handleRecordPress = (record: MaternalRecord) => {
    router.push({
      pathname: '/(nurse)/menu/maternaldetails',
      params: { maternalData: JSON.stringify(record) }
    });
  };

  const renderRecord = ({ item }: { item: MaternalRecord }) => (
    <MaternalCard
      record={item}
      onPress={() => handleRecordPress(item)}
    />
  );

  const getStatusCounts = () => {
    const pregnant = maternalRecords.filter(r => r.status === 'pregnant').length;
    const postpartum = maternalRecords.filter(r => r.status === 'postpartum').length;
    const nonPregnant = maternalRecords.filter(r => r.status === 'non-pregnant').length;
    return { pregnant, postpartum, nonPregnant };
  };

  const statusCounts = getStatusCounts();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Maternal Health Records
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {filteredRecords.length} maternal records found
        </ThemedText>
      </View>

      {/* Status Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: '#3B82F6' }]} />
          <View>
            <ThemedText style={styles.summaryCount}>{statusCounts.pregnant}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Pregnant</ThemedText>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
          <View>
            <ThemedText style={styles.summaryCount}>{statusCounts.postpartum}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Postpartum</ThemedText>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: '#6B7280' }]} />
          <View>
            <ThemedText style={styles.summaryCount}>{statusCounts.nonPregnant}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Others</ThemedText>
          </View>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or address..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </Pressable>
          )}
        </View>
        
        <View style={styles.filterContainer}>
          {[
            { key: 'all', label: 'All' },
            { key: 'pregnant', label: 'Pregnant' },
            { key: 'postpartum', label: 'Postpartum' },
            { key: 'non-pregnant', label: 'Others' },
          ].map((filter) => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterButton,
                filterStatus === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(filter.key as any)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  filterStatus === filter.key && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No maternal records found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try adjusting your search or filter
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
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
    paddingTop: 8,
  },
  maternalCard: {
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
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF3D33',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  residentId: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nhtsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#6B7280',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
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
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
});