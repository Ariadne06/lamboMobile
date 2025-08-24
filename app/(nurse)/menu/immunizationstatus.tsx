import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

type VaccinationRecord = {
  id: string;
  residentId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  age: number;
  vaccine: string;
  dose: string;
  dueDate: string;
  status: 'pending' | 'administered' | 'overdue';
  administeredDate?: string;
  administeredBy?: string;
  remarks?: string;
  householdId: string;
};

// Sample vaccination records
const vaccinationRecords: VaccinationRecord[] = [
  {
    id: '1',
    residentId: 'R-0003',
    fullName: 'Sofia Villarta Villarta',
    firstName: 'Sofia',
    lastName: 'Villarta',
    age: 9,
    vaccine: 'MMR',
    dose: '2nd Dose',
    dueDate: '2024-02-15',
    status: 'pending',
    householdId: 'HH-0001',
  },
  {
    id: '2',
    residentId: 'R-0004',
    fullName: 'Marco Villarta Villarta',
    firstName: 'Marco',
    lastName: 'Villarta',
    age: 5,
    vaccine: 'DPT',
    dose: '4th Dose (Booster)',
    dueDate: '2024-01-20',
    status: 'overdue',
    householdId: 'HH-0001',
  },
  {
    id: '3',
    residentId: 'R-0012',
    fullName: 'Pedro Villanueva Bugtai',
    firstName: 'Pedro',
    lastName: 'Bugtai',
    age: 14,
    vaccine: 'HPV',
    dose: '1st Dose',
    dueDate: '2024-02-28',
    status: 'pending',
    householdId: 'HH-0003',
  },
  {
    id: '4',
    residentId: 'R-0013',
    fullName: 'Maria Grace Santos Cruz',
    firstName: 'Maria',
    lastName: 'Cruz',
    age: 12,
    vaccine: 'Td',
    dose: '1st Dose',
    dueDate: '2024-01-25',
    status: 'administered',
    administeredDate: '2024-01-25',
    administeredBy: 'Nurse Johnson',
    remarks: 'No adverse reactions',
    householdId: 'HH-0002',
  },
  {
    id: '5',
    residentId: 'R-0014',
    fullName: 'Jose Miguel Santos Reyes',
    firstName: 'Jose',
    lastName: 'Reyes',
    age: 7,
    vaccine: 'IPV',
    dose: '3rd Dose',
    dueDate: '2024-02-10',
    status: 'pending',
    householdId: 'HH-0001',
  },
  {
    id: '6',
    residentId: 'R-0015',
    fullName: 'Ana Marie Lopez Garcia',
    firstName: 'Ana',
    lastName: 'Garcia',
    age: 2,
    vaccine: 'BCG',
    dose: '1st Dose',
    dueDate: '2024-01-30',
    status: 'pending',
    householdId: 'HH-0002',
  },
  {
    id: '7',
    residentId: 'R-0016',
    fullName: 'Carlos David Reyes Morales',
    firstName: 'Carlos',
    lastName: 'Morales',
    age: 6,
    vaccine: 'HEPA B',
    dose: '3rd Dose',
    dueDate: '2024-02-05',
    status: 'pending',
    householdId: 'HH-0003',
  },
  {
    id: '8',
    residentId: 'R-0017',
    fullName: 'Isabella Rose Santos Luna',
    firstName: 'Isabella',
    lastName: 'Luna',
    age: 4,
    vaccine: 'OPV',
    dose: '4th Dose',
    dueDate: '2024-01-18',
    status: 'overdue',
    householdId: 'HH-0001',
  },
];

const VaccinationCard = ({ 
  record, 
  onAdminister, 
  onViewDetails 
}: { 
  record: VaccinationRecord; 
  onAdminister: () => void;
  onViewDetails: () => void;
}) => {
  const getStatusColor = () => {
    switch (record.status) {
      case 'administered': return '#10B981';
      case 'overdue': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (record.status) {
      case 'administered': return 'Completed';
      case 'overdue': return 'Overdue';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <Pressable style={styles.vaccinationCard} onPress={onViewDetails}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="medical" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardInfo}>
          <ThemedText type="defaultSemiBold" style={styles.patientName}>
            {record.fullName}
          </ThemedText>
          <ThemedText style={styles.vaccineInfo}>
            {record.vaccine} - {record.dose}
          </ThemedText>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
          </View>
        </View>
        <View style={styles.actionContainer}>
          {record.status !== 'administered' && (
            <Pressable 
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={onAdminister}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText}>
            Due: {new Date(record.dueDate).toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText}>Age: {record.age}</ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="home-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.detailText} numberOfLines={1}>
            {record.householdId}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
};

const DetailRow = ({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) => (
  <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
    <ThemedText style={styles.detailLabel}>{label}</ThemedText>
    <ThemedText style={styles.detailValue} numberOfLines={2}>
      {value}
    </ThemedText>
  </View>
);

export default function ImmunizationStatus() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue' | 'administered'>('all');
  const [records, setRecords] = useState(vaccinationRecords);

  const filteredRecords = React.useMemo(() => {
    let filtered = records;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }
    
    // Filter by search query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(record =>
        record.fullName.toLowerCase().includes(query) ||
        record.vaccine.toLowerCase().includes(query) ||
        record.residentId.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [searchQuery, filterStatus, records]);

  const handleAdminister = (recordId: string) => {
    Alert.alert(
      'Administer Vaccine',
      'Confirm that you have administered this vaccine to the patient.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            setRecords(prevRecords =>
              prevRecords.map(record =>
                record.id === recordId
                  ? {
                      ...record,
                      status: 'administered' as const,
                      administeredDate: new Date().toISOString().split('T')[0],
                      administeredBy: 'Current Nurse',
                      remarks: 'Administered successfully',
                    }
                  : record
              )
            );
            Alert.alert('Success', 'Vaccine has been marked as administered.');
          },
        },
      ]
    );
  };

  const renderRecord = ({ item }: { item: VaccinationRecord }) => (
    <VaccinationCard
      record={item}
      onAdminister={() => handleAdminister(item.id)}
      onViewDetails={() => setSelectedRecord(item)}
    />
  );

  const getStatusCounts = () => {
    const pending = records.filter(r => r.status === 'pending').length;
    const overdue = records.filter(r => r.status === 'overdue').length;
    const administered = records.filter(r => r.status === 'administered').length;
    return { pending, overdue, administered };
  };

  const statusCounts = getStatusCounts();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Immunization Status
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {filteredRecords.length} vaccination records
        </ThemedText>
      </View>

      {/* Status Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: '#F59E0B' }]} />
          <View>
            <ThemedText style={styles.summaryCount}>{statusCounts.pending}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Pending</ThemedText>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: '#EF4444' }]} />
          <View>
            <ThemedText style={styles.summaryCount}>{statusCounts.overdue}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Overdue</ThemedText>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
          <View>
            <ThemedText style={styles.summaryCount}>{statusCounts.administered}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Completed</ThemedText>
          </View>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, vaccine, or ID..."
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
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'administered', label: 'Completed' },
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
        </ScrollView>
      </View>

      {/* Vaccination Records List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No vaccination records found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try adjusting your search or filter
            </ThemedText>
          </View>
        }
      />

      {/* Record Details Modal */}
      <Modal
        visible={selectedRecord !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <View style={styles.modalAvatarContainer}>
                  <Ionicons name="medical" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <ThemedText type="title" style={styles.modalTitle}>
                    {selectedRecord?.fullName}
                  </ThemedText>
                  <ThemedText style={styles.modalSubtitle}>
                    {selectedRecord?.vaccine} - {selectedRecord?.dose}
                  </ThemedText>
                </View>
              </View>
              <Pressable
                onPress={() => setSelectedRecord(null)}
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
              {selectedRecord && (
                <>
                  {/* Patient Information */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="person" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Patient Information
                      </ThemedText>
                    </View>
                    <View style={styles.sectionContent}>
                      <DetailRow label="Full Name" value={selectedRecord.fullName} />
                      <DetailRow label="Resident ID" value={selectedRecord.residentId} />
                      <DetailRow label="Age" value={selectedRecord.age.toString()} />
                      <DetailRow label="Household ID" value={selectedRecord.householdId} isLast />
                    </View>
                  </View>

                  {/* Vaccination Details */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="medical" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Vaccination Details
                      </ThemedText>
                    </View>
                    <View style={styles.sectionContent}>
                      <DetailRow label="Vaccine" value={selectedRecord.vaccine} />
                      <DetailRow label="Dose" value={selectedRecord.dose} />
                      <DetailRow label="Due Date" value={new Date(selectedRecord.dueDate).toLocaleDateString()} />
                      <DetailRow label="Status" value={selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)} />
                      {selectedRecord.administeredDate && (
                        <DetailRow label="Administered Date" value={new Date(selectedRecord.administeredDate).toLocaleDateString()} />
                      )}
                      {selectedRecord.administeredBy && (
                        <DetailRow label="Administered By" value={selectedRecord.administeredBy} />
                      )}
                      <DetailRow label="Remarks" value={selectedRecord.remarks || 'No remarks'} isLast />
                    </View>
                  </View>

                  {/* Action Button */}
                  {selectedRecord.status !== 'administered' && (
                    <View style={styles.section}>
                      <Pressable
                        style={styles.administerButton}
                        onPress={() => {
                          handleAdminister(selectedRecord.id);
                          setSelectedRecord(null);
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        <ThemedText style={styles.administerButtonText}>
                          Mark as Administered
                        </ThemedText>
                      </Pressable>
                    </View>
                  )}
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
  vaccinationCard: {
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
  vaccineInfo: {
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
  actionContainer: {
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  administerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
  },
  administerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});