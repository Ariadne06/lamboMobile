import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';

const mockHouseholds = [
  {
    id: 1,
    householdId: 'HH-2024-001',
    householdNumber: 'HH-001',
    householdHead: 'Juan Dela Cruz',
    sitio: 'Purok 1',
    barangay: 'Barangay Sample',
    familyNumber: 'F-001',
    memberCount: 5,
    status: 'Active',
    dateOfVisit: '2024-01-15',
    quarter: 'Q1 2024',
  },
  {
    id: 2,
    householdId: 'HH-2024-002',
    householdNumber: 'HH-002',
    householdHead: 'Maria Santos',
    sitio: 'Purok 2',
    barangay: 'Barangay Sample',
    familyNumber: 'F-002',
    memberCount: 3,
    status: 'Active',
    dateOfVisit: '2024-01-20',
    quarter: 'Q1 2024',
  },
  {
    id: 3,
    householdId: 'HH-2024-003',
    householdNumber: 'HH-003',
    householdHead: 'Pedro Garcia',
    sitio: 'Purok 3',
    barangay: 'Barangay Sample',
    familyNumber: 'F-003',
    memberCount: 4,
    status: 'Active',
    dateOfVisit: '2024-01-25',
    quarter: 'Q1 2024',
  },
];

export default function ViewHouseholds() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHouseholds = mockHouseholds.filter(household =>
    household.householdId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    household.householdHead.toLowerCase().includes(searchQuery.toLowerCase()) ||
    household.sitio.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const renderHouseholdCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
  
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.householdInfo}>
          <ThemedText style={styles.householdId}>{item.householdId}</ThemedText>
          <ThemedText style={styles.householdHead}>Head: {item.householdHead}</ThemedText>
          <ThemedText style={styles.location}>{item.sitio}, {item.barangay}</ThemedText>
        </View>
        <View style={styles.rightSection}>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#DCFCE7' : '#FEF2F2' }]}>
            <ThemedText style={[styles.statusText, { color: item.status === 'Active' ? '#16A34A' : '#DC2626' }]}>
              {item.status}
            </ThemedText>
          </View>
          <View style={styles.memberCount}>
            <Ionicons name="people" size={14} color="#6B7280" />
            <ThemedText style={styles.memberText}>{item.memberCount} members</ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <ThemedText style={styles.dateText}>Last visit: {item.dateOfVisit}</ThemedText>
        </View>
        <View style={styles.actionIndicator}>
          <ThemedText style={styles.viewText}>View Details</ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Household List" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{mockHouseholds.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Households</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {mockHouseholds.reduce((sum, h) => sum + h.memberCount, 0)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Members</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {mockHouseholds.filter(h => h.status === 'Active').length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Active</ThemedText>
            </View>
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search households..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FlatList
          data={filteredHouseholds}
          renderItem={renderHouseholdCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3D33',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  householdInfo: {
    flex: 1,
    marginRight: 12,
  },
  householdId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  householdHead: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
});