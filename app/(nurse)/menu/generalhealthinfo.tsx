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

type ChildHealthRecord = {
  id: string;
  householdId: string;
  residentId: string;
  fullName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number;
  sex: string;
  membershipType: string;
  philhealthId?: string;
  medicalHistory?: string;
  smoker: boolean;
  alcoholicDrinker: boolean;
  sexuallyActive: boolean;
  lastMenstrualPeriod?: string;
  ageOfMenarche?: number;
  fpUse: boolean;
  educationalAttainment: string;
  ageHealthRiskGroup: string;
  remarks: string;
};

// Sample child health records
const childHealthRecords: ChildHealthRecord[] = [
  {
    id: '1',
    householdId: 'HH-0001',
    residentId: 'R-0003',
    fullName: 'Sofia Villarta Villarta',
    firstName: 'Sofia',
    middleName: 'Villarta',
    lastName: 'Villarta',
    age: 9,
    sex: 'Female',
    membershipType: 'Dependent',
    philhealthId: 'PH-123456791',
    medicalHistory: 'None',
    smoker: false,
    alcoholicDrinker: false,
    sexuallyActive: false,
    fpUse: false,
    educationalAttainment: 'Elementary',
    ageHealthRiskGroup: 'Child',
    remarks: 'Vaccinated - Complete for age',
  },
  {
    id: '2',
    householdId: 'HH-0001',
    residentId: 'R-0004',
    fullName: 'Marco Villarta Villarta',
    firstName: 'Marco',
    middleName: 'Villarta',
    lastName: 'Villarta',
    age: 5,
    sex: 'Male',
    membershipType: 'Dependent',
    philhealthId: 'PH-123456792',
    medicalHistory: 'Asthma - Mild intermittent',
    smoker: false,
    alcoholicDrinker: false,
    sexuallyActive: false,
    fpUse: false,
    educationalAttainment: 'Pre-school',
    ageHealthRiskGroup: 'Child',
    remarks: 'Vaccinated - Up to date',
  },
  {
    id: '3',
    householdId: 'HH-0003',
    residentId: 'R-0012',
    fullName: 'Pedro Villanueva Bugtai',
    firstName: 'Pedro',
    middleName: 'Villanueva',
    lastName: 'Bugtai',
    age: 14,
    sex: 'Male',
    membershipType: 'Dependent',
    philhealthId: 'PH-456789127',
    medicalHistory: 'None',
    smoker: false,
    alcoholicDrinker: false,
    sexuallyActive: false,
    fpUse: false,
    educationalAttainment: 'Elementary',
    ageHealthRiskGroup: 'Adolescent',
    remarks: 'Vaccinated - Complete',
  },
  {
    id: '4',
    householdId: 'HH-0002',
    residentId: 'R-0013',
    fullName: 'Maria Grace Santos Cruz',
    firstName: 'Maria',
    middleName: 'Grace Santos',
    lastName: 'Cruz',
    age: 12,
    sex: 'Female',
    membershipType: 'Dependent',
    philhealthId: 'PH-987654324',
    medicalHistory: 'Allergic rhinitis',
    smoker: false,
    alcoholicDrinker: false,
    sexuallyActive: false,
    lastMenstrualPeriod: '2024-01-15',
    ageOfMenarche: 12,
    fpUse: false,
    educationalAttainment: 'Elementary',
    ageHealthRiskGroup: 'Adolescent',
    remarks: 'Vaccinated - Up to date',
  },
  {
    id: '5',
    householdId: 'HH-0001',
    residentId: 'R-0014',
    fullName: 'Jose Miguel Santos Reyes',
    firstName: 'Jose',
    middleName: 'Miguel Santos',
    lastName: 'Reyes',
    age: 7,
    sex: 'Male',
    membershipType: 'Dependent',
    philhealthId: 'PH-555666777',
    medicalHistory: 'None',
    smoker: false,
    alcoholicDrinker: false,
    sexuallyActive: false,
    fpUse: false,
    educationalAttainment: 'Elementary',
    ageHealthRiskGroup: 'Child',
    remarks: 'Vaccinated - Complete for age',
  },
];

const ChildHealthCard = ({ child, onPress }: { child: ChildHealthRecord; onPress: () => void }) => (
  <Pressable style={styles.childCard} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={styles.avatarContainer}>
        <ThemedText style={styles.avatarText}>
          {child.firstName[0]}{child.lastName[0]}
        </ThemedText>
      </View>
      <View style={styles.cardInfo}>
        <ThemedText type="defaultSemiBold" style={styles.childName}>
          {child.fullName}
        </ThemedText>
        <ThemedText style={styles.householdId}>Household: {child.householdId}</ThemedText>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { 
            backgroundColor: child.remarks.includes('Vaccinated') ? '#10B981' : '#F59E0B' 
          }]} />
          <ThemedText style={styles.statusText}>
            {child.remarks.includes('Vaccinated') ? 'Vaccinated' : 'Incomplete'}
          </ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
    
    <View style={styles.cardDetails}>
      <View style={styles.detailItem}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>Age: {child.age}</ThemedText>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="person-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>{child.sex}</ThemedText>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="medical-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText} numberOfLines={1}>
          {child.ageHealthRiskGroup}
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

export default function GeneralHealthInfo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChild, setSelectedChild] = useState<ChildHealthRecord | null>(null);

  const filteredChildren = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return childHealthRecords;
    
    return childHealthRecords.filter(child =>
      child.fullName.toLowerCase().includes(query) ||
      child.householdId.toLowerCase().includes(query) ||
      child.residentId.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const renderChild = ({ item }: { item: ChildHealthRecord }) => (
    <ChildHealthCard
      child={item}
      onPress={() => setSelectedChild(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          General Health Information
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
            placeholder="Search by name, household ID, or resident ID..."
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
            <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No children found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try adjusting your search terms
            </ThemedText>
          </View>
        }
      />

      {/* Child Details Modal */}
      <Modal
        visible={selectedChild !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedChild(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <View style={styles.modalAvatarContainer}>
                  <ThemedText style={styles.modalAvatarText}>
                    {selectedChild?.firstName?.[0] || ''}{selectedChild?.lastName?.[0] || ''}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="title" style={styles.modalTitle}>
                    {selectedChild?.fullName}
                  </ThemedText>
                  <ThemedText style={styles.modalSubtitle}>
                    ID: {selectedChild?.residentId}
                  </ThemedText>
                </View>
              </View>
              <Pressable
                onPress={() => setSelectedChild(null)}
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
              {selectedChild && (
                <>
                  {/* Basic Information */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="person" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Basic Information
                      </ThemedText>
                    </View>
                    <View style={styles.sectionContent}>
                      <DetailRow label="Full Name" value={selectedChild.fullName} />
                      <DetailRow label="First Name" value={selectedChild.firstName} />
                      <DetailRow label="Middle Name" value={selectedChild.middleName || 'N/A'} />
                      <DetailRow label="Last Name" value={selectedChild.lastName} />
                      <DetailRow label="Age" value={selectedChild.age.toString()} />
                      <DetailRow label="Sex" value={selectedChild.sex} />
                      <DetailRow label="Household ID" value={selectedChild.householdId} isLast />
                    </View>
                  </View>

                  {/* Health Information */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="medical" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Health Information
                      </ThemedText>
                    </View>
                    <View style={styles.sectionContent}>
                      <DetailRow label="Membership Type" value={selectedChild.membershipType} />
                      <DetailRow label="PhilHealth ID" value={selectedChild.philhealthId || 'N/A'} />
                      <DetailRow label="Medical History" value={selectedChild.medicalHistory || 'None'} />
                      <DetailRow label="Smoker" value={selectedChild.smoker ? 'Yes' : 'No'} />
                      <DetailRow label="Alcoholic Drinker" value={selectedChild.alcoholicDrinker ? 'Yes' : 'No'} />
                      <DetailRow label="Sexually Active" value={selectedChild.sexuallyActive ? 'Yes' : 'No'} />
                      {selectedChild.sex === 'Female' && (
                        <>
                          <DetailRow label="Last Menstrual Period" value={selectedChild.lastMenstrualPeriod || 'N/A'} />
                          <DetailRow label="Age of Menarche" value={selectedChild.ageOfMenarche?.toString() || 'N/A'} />
                        </>
                      )}
                      <DetailRow label="FP Use" value={selectedChild.fpUse ? 'Yes' : 'No'} />
                      <DetailRow label="Educational Attainment" value={selectedChild.educationalAttainment} />
                      <DetailRow label="Age/Health Risk Group" value={selectedChild.ageHealthRiskGroup} />
                      <DetailRow label="Remarks" value={selectedChild.remarks} isLast />
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
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  householdId: {
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