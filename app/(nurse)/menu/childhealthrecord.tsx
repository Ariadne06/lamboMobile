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

type ChildRecord = {
  id: string;
  residentId: string;
  childFullName: string;
  firstName: string;
  lastName: string;
  motherFullName: string;
  fatherFullName: string;
  philhealthId: string;
  phoneNumber: string;
  sex: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthWeight: number;
  birthHeight: number;
  placeOfDelivery: string;
  ttStatusOfMother: string;
  dateTTStatusAssessed: string;
  newbornScreeningStatus: boolean;
  newbornScreeningDate?: string;
  feedingMethod: 'breastfeeding' | 'bottle feeding' | 'mixed';
  age: number;
};

// Sample child health records
const childRecords: ChildRecord[] = [
  {
    id: '1',
    residentId: 'R-0018',
    childFullName: 'Angel Mae Majarocon Bugtai',
    firstName: 'Angel Mae',
    lastName: 'Bugtai',
    motherFullName: 'Prescious Mae Bugtai',
    fatherFullName: 'Miles Majarocon',
    philhealthId: 'PH-789123456',
    phoneNumber: '+63-912-345-6789',
    sex: 'Female',
    dateOfBirth: '2023-06-15',
    timeOfBirth: '14:30',
    birthWeight: 3.2,
    birthHeight: 48.5,
    placeOfDelivery: 'Consolacion District Hospital',
    ttStatusOfMother: 'TT2 - Complete',
    dateTTStatusAssessed: '2023-04-20',
    newbornScreeningStatus: true,
    newbornScreeningDate: '2023-06-18',
    feedingMethod: 'breastfeeding',
    age: 8,
  },
  {
    id: '2',
    residentId: 'R-0019',
    childFullName: 'Gabriel Cruz Santos',
    firstName: 'Gabriel',
    lastName: 'Santos',
    motherFullName: 'Maria Luz Santos',
    fatherFullName: 'Roberto Cruz Santos',
    philhealthId: 'PH-456789123',
    phoneNumber: '+63-920-456-7890',
    sex: 'Male',
    dateOfBirth: '2022-11-22',
    timeOfBirth: '09:15',
    birthWeight: 3.5,
    birthHeight: 50.0,
    placeOfDelivery: 'Cebu Provincial Hospital',
    ttStatusOfMother: 'TT5 - Fully Protected',
    dateTTStatusAssessed: '2022-09-10',
    newbornScreeningStatus: true,
    newbornScreeningDate: '2022-11-25',
    feedingMethod: 'mixed',
    age: 14,
  },
  {
    id: '3',
    residentId: 'R-0020',
    childFullName: 'Sofia Grace Reyes Luna',
    firstName: 'Sofia Grace',
    lastName: 'Luna',
    motherFullName: 'Carmen Rose Reyes',
    fatherFullName: 'David Miguel Luna',
    philhealthId: 'PH-321654987',
    phoneNumber: '+63-917-789-0123',
    sex: 'Female',
    dateOfBirth: '2021-03-08',
    timeOfBirth: '22:45',
    birthWeight: 2.8,
    birthHeight: 46.0,
    placeOfDelivery: 'Sacred Heart Hospital',
    ttStatusOfMother: 'TT3 - Protected',
    dateTTStatusAssessed: '2021-01-15',
    newbornScreeningStatus: false,
    feedingMethod: 'bottle feeding',
    age: 35,
  },
  {
    id: '4',
    residentId: 'R-0021',
    childFullName: 'Ethan James Villarta Cruz',
    firstName: 'Ethan James',
    lastName: 'Cruz',
    motherFullName: 'Anna Marie Villarta',
    fatherFullName: 'Carlos James Cruz',
    philhealthId: 'PH-654321098',
    phoneNumber: '+63-918-234-5678',
    sex: 'Male',
    dateOfBirth: '2023-12-10',
    timeOfBirth: '06:20',
    birthWeight: 3.1,
    birthHeight: 49.0,
    placeOfDelivery: 'Consolacion Birthing Center',
    ttStatusOfMother: 'TT2 - Complete',
    dateTTStatusAssessed: '2023-10-05',
    newbornScreeningStatus: true,
    newbornScreeningDate: '2023-12-13',
    feedingMethod: 'breastfeeding',
    age: 2,
  },
  {
    id: '5',
    residentId: 'R-0022',
    childFullName: 'Isabella Rose Garcia Morales',
    firstName: 'Isabella Rose',
    lastName: 'Morales',
    motherFullName: 'Lisa Anne Garcia',
    fatherFullName: 'Miguel Antonio Morales',
    philhealthId: 'PH-987654321',
    phoneNumber: '+63-919-876-5432',
    sex: 'Female',
    dateOfBirth: '2022-08-30',
    timeOfBirth: '16:10',
    birthWeight: 3.3,
    birthHeight: 51.0,
    placeOfDelivery: 'Danao City Hospital',
    ttStatusOfMother: 'TT4 - Long-term Protection',
    dateTTStatusAssessed: '2022-06-20',
    newbornScreeningStatus: true,
    newbornScreeningDate: '2022-09-02',
    feedingMethod: 'mixed',
    age: 17,
  },
];

const ChildHealthCard = ({ child, onPress }: { child: ChildRecord; onPress: () => void }) => (
  <Pressable style={styles.childCard} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.cardInfo}>
        <ThemedText type="defaultSemiBold" style={styles.childName}>
          {child.childFullName}
        </ThemedText>
        <ThemedText style={styles.residentId}>ID: {child.residentId}</ThemedText>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { 
            backgroundColor: child.newbornScreeningStatus ? '#10B981' : '#F59E0B' 
          }]} />
          <ThemedText style={styles.statusText}>
            {child.newbornScreeningStatus ? 'Screening Complete' : 'Screening Pending'}
          </ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
    
    <View style={styles.cardDetails}>
      <View style={styles.detailItem}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>
          {child.age} months old
        </ThemedText>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="person-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>{child.sex}</ThemedText>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="restaurant-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText} numberOfLines={1}>
          {child.feedingMethod}
        </ThemedText>
      </View>
    </View>
  </Pressable>
);

export default function ChildHealthRecord() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChildren = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return childRecords;
    
    return childRecords.filter(child =>
      child.childFullName.toLowerCase().includes(query) ||
      child.residentId.toLowerCase().includes(query) ||
      child.motherFullName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleChildPress = (child: ChildRecord) => {
    router.push({
      pathname: '/(nurse)/menu/childdetails',
      params: { childData: JSON.stringify(child) }
    });
  };

  const renderChild = ({ item }: { item: ChildRecord }) => (
    <ChildHealthCard
      child={item}
      onPress={() => handleChildPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Child Health Records
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {filteredChildren.length} children found
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by child name, ID, or mother's name..."
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
      </View>

      {/* Children List */}
      <FlatList
        data={filteredChildren}
        keyExtractor={(item) => item.id}
        renderItem={renderChild}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No children found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try adjusting your search terms
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
  listContainer: {
    padding: 20,
    paddingTop: 8,
  },
  childCard: {
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
  childName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  residentId: {
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