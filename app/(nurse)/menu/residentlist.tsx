import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

type ResidentRow = {
  id: string;
  residentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob?: string;
  sex?: string;
  religion?: string;
  civilStatus?: string;
  educationalAttainment?: string;
  residentStatus?: string;
  houseNo?: string;
  street?: string;
  barangay?: string;
  sitio?: string;
  city?: string;
};

// Optimized data with only 3 residents
const residents: ResidentRow[] = [
  {
    id: '1',
    residentId: 'R-0001',
    firstName: 'Alyssa',
    middleName: 'D.',
    lastName: 'Santos',
    dob: '1996-04-18',
    sex: 'Female',
    religion: 'Catholic',
    civilStatus: 'Single',
    educationalAttainment: 'College',
    residentStatus: 'Active',
    houseNo: '12-B',
    street: 'Mango St.',
    barangay: 'Cansaga',
    sitio: 'Purok 1',
    city: 'Consolacion',
  },
  {
    id: '2',
    residentId: 'R-0002',
    firstName: 'Juan',
    middleName: 'M.',
    lastName: 'Cruz',
    dob: '1985-07-22',
    sex: 'Male',
    religion: 'Catholic',
    civilStatus: 'Married',
    educationalAttainment: 'High School',
    residentStatus: 'Active',
    houseNo: '45-A',
    street: 'Sampaguita St.',
    barangay: 'Cansaga',
    sitio: 'Purok 2',
    city: 'Consolacion',
  },
  {
    id: '3',
    residentId: 'R-0003',
    firstName: 'Maria',
    middleName: 'L.',
    lastName: 'Garcia',
    dob: '1992-12-05',
    sex: 'Female',
    religion: 'Catholic',
    civilStatus: 'Single',
    educationalAttainment: 'College',
    residentStatus: 'Active',
    houseNo: '78-C',
    street: 'Rose St.',
    barangay: 'Cansaga',
    sitio: 'Purok 3',
    city: 'Consolacion',
  },
];

const ResidentCard = ({ resident, onPress }: { resident: ResidentRow; onPress: () => void }) => (
  <Pressable style={styles.residentCard} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={styles.avatarContainer}>
        <ThemedText style={styles.avatarText}>
          {resident.firstName[0]}{resident.lastName[0]}
        </ThemedText>
      </View>
      <View style={styles.cardInfo}>
        <ThemedText type="defaultSemiBold" style={styles.residentName}>
          {resident.firstName} {resident.lastName}
        </ThemedText>
        <ThemedText style={styles.residentId}>ID: {resident.residentId}</ThemedText>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: resident.residentStatus === 'Active' ? '#10B981' : '#F59E0B' }]} />
          <ThemedText style={styles.statusText}>{resident.residentStatus}</ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
    
    <View style={styles.cardDetails}>
      <View style={styles.detailItem}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>
          {resident.dob ? new Date(resident.dob).toLocaleDateString() : 'N/A'}
        </ThemedText>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="person-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>{resident.sex || 'N/A'}</ThemedText>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="location-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText} numberOfLines={1}>
          {resident.sitio}, {resident.barangay}
        </ThemedText>
      </View>
    </View>
  </Pressable>
);

const DetailRow = ({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) => (
  <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
    <ThemedText style={styles.detailLabel}>{label}</ThemedText>
    <ThemedText style={styles.detailValue} numberOfLines={2}>
      {value}
    </ThemedText>
  </View>
);

export default function ResidentListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState<ResidentRow | null>(null);

  const filteredResidents = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return residents;
    
    return residents.filter(resident =>
      resident.residentId.toLowerCase().includes(query) ||
      resident.firstName.toLowerCase().includes(query) ||
      resident.lastName.toLowerCase().includes(query) ||
      resident.sitio?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const renderResident = ({ item }: { item: ResidentRow }) => (
    <ResidentCard
      resident={item}
      onPress={() => setSelectedResident(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Resident List
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {filteredResidents.length} residents found
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, name, or location..."
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

      {/* Residents List */}
      <FlatList
        data={filteredResidents}
        keyExtractor={(item) => item.id}
        renderItem={renderResident}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No residents found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try adjusting your search terms
            </ThemedText>
          </View>
        }
      />

      {/* Details Modal */}
      <Modal
        visible={selectedResident !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedResident(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <View style={styles.modalAvatarContainer}>
                  <ThemedText style={styles.modalAvatarText}>
                    {selectedResident?.firstName?.[0] || ''}{selectedResident?.lastName?.[0] || ''}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="title" style={styles.modalTitle}>
                    {selectedResident?.firstName} {selectedResident?.lastName}
                  </ThemedText>
                  <ThemedText style={styles.modalSubtitle}>
                    ID: {selectedResident?.residentId}
                  </ThemedText>
                </View>
              </View>
              <Pressable
                onPress={() => setSelectedResident(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Modal Content */}
            <ScrollView 
              style={styles.modalContent} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {selectedResident && (
                <>
                  {/* Personal Data Section */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="person" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Personal Data
                      </ThemedText>
                    </View>
                    <View style={styles.sectionContent}>
                      <DetailRow label="First Name" value={selectedResident.firstName || 'N/A'} />
                      <DetailRow label="Middle Name" value={selectedResident.middleName || 'N/A'} />
                      <DetailRow label="Last Name" value={selectedResident.lastName || 'N/A'} />
                      <DetailRow label="Date of Birth" value={selectedResident.dob ? new Date(selectedResident.dob).toLocaleDateString() : 'N/A'} />
                      <DetailRow label="Sex" value={selectedResident.sex || 'N/A'} />
                      <DetailRow label="Religion" value={selectedResident.religion || 'N/A'} />
                      <DetailRow label="Civil Status" value={selectedResident.civilStatus || 'N/A'} />
                      <DetailRow label="Educational Attainment" value={selectedResident.educationalAttainment || 'N/A'} />
                      <DetailRow label="Resident Status" value={selectedResident.residentStatus || 'N/A'} isLast />
                    </View>
                  </View>

                  {/* Address Section */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="location" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Address
                      </ThemedText>
                    </View>
                    <View style={styles.sectionContent}>
                      <DetailRow label="House Number" value={selectedResident.houseNo || 'N/A'} />
                      <DetailRow label="Street" value={selectedResident.street || 'N/A'} />
                      <DetailRow label="Barangay" value={selectedResident.barangay || 'N/A'} />
                      <DetailRow label="Sitio" value={selectedResident.sitio || 'N/A'} />
                      <DetailRow label="City" value={selectedResident.city || 'N/A'} isLast />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  residentCard: {
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
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  residentName: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF3D33',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 24,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginLeft: 10,
    fontWeight: '600',
  },
  sectionContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});