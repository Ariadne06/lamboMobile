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

type FamilyMember = {
  id: string;
  residentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  sex: string;
  relationshipToHead: string;
  civilStatus: string;
  religion: string;
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

type Household = {
  id: string;
  householdId: string;
  dateOfVisit: string;
  quarter: string;
  householdNo: string;
  familyNo: string;
  householdHead: string;
  sitio: string;
  barangay: string;
  selectOne: string;
  typeOfWaterSource: string;
  toiletFacility: string;
  typeOfWasteManagement: string;
  blincDrainage: boolean;
  renter: boolean;
  renterMonths?: number;
  familyMembers: FamilyMember[];
};

// Sample data with 3 households and multiple family members
const households: Household[] = [
  {
    id: '1',
    householdId: 'HH-0001',
    dateOfVisit: '2024-01-15',
    quarter: 'Q1',
    householdNo: 'H001',
    familyNo: 'F001',
    householdHead: 'Adrianne Mabanag Villarta',
    sitio: 'Purok 1',
    barangay: 'Cansaga',
    selectOne: 'Non-NHTS',
    typeOfWaterSource: '1-Point source',
    toiletFacility: 'B- connected to septic and sewarage system',
    typeOfWasteManagement: 'A - Waste Segragation',
    blincDrainage: true,
    renter: false,
    familyMembers: [
      {
        id: '1',
        residentId: 'R-0001',
        firstName: 'Adrianne',
        middleName: 'Mabanag',
        lastName: 'Villarta',
        dob: '1990-05-15',
        sex: 'Female',
        relationshipToHead: 'Head',
        civilStatus: 'Married',
        religion: 'Catholic',
        membershipType: 'Regular',
        philhealthId: 'PH-123456789',
        medicalHistory: 'Hypertension',
        smoker: false,
        alcoholicDrinker: false,
        sexuallyActive: true,
        lastMenstrualPeriod: '2024-01-10',
        ageOfMenarche: 13,
        fpUse: true,
        educationalAttainment: 'College',
        ageHealthRiskGroup: 'Adult',
        remarks: 'Vaccinated',
      },
      {
        id: '2',
        residentId: 'R-0002',
        firstName: 'Miguel',
        middleName: 'Santos',
        lastName: 'Villarta',
        dob: '1988-03-22',
        sex: 'Male',
        relationshipToHead: 'Spouse',
        civilStatus: 'Married',
        religion: 'Catholic',
        membershipType: 'Regular',
        philhealthId: 'PH-123456790',
        medicalHistory: 'None',
        smoker: false,
        alcoholicDrinker: true,
        sexuallyActive: true,
        fpUse: false,
        educationalAttainment: 'College',
        ageHealthRiskGroup: 'Adult',
        remarks: 'Vaccinated',
      },
      {
        id: '3',
        residentId: 'R-0003',
        firstName: 'Sofia',
        middleName: 'Villarta',
        lastName: 'Villarta',
        dob: '2015-08-12',
        sex: 'Female',
        relationshipToHead: 'Daughter',
        civilStatus: 'Single',
        religion: 'Catholic',
        membershipType: 'Dependent',
        philhealthId: 'PH-123456791',
        medicalHistory: 'None',
        smoker: false,
        alcoholicDrinker: false,
        sexuallyActive: false,
        fpUse: false,
        educationalAttainment: 'Elementary',
        ageHealthRiskGroup: 'Child',
        remarks: 'Vaccinated',
      },
      {
        id: '4',
        residentId: 'R-0004',
        firstName: 'Marco',
        middleName: 'Villarta',
        lastName: 'Villarta',
        dob: '2018-11-05',
        sex: 'Male',
        relationshipToHead: 'Son',
        civilStatus: 'Single',
        religion: 'Catholic',
        membershipType: 'Dependent',
        philhealthId: 'PH-123456792',
        medicalHistory: 'Asthma',
        smoker: false,
        alcoholicDrinker: false,
        sexuallyActive: false,
        fpUse: false,
        educationalAttainment: 'Pre-school',
        ageHealthRiskGroup: 'Child',
        remarks: 'Vaccinated',
      },
    ],
  },
  {
    id: '2',
    householdId: 'HH-0002',
    dateOfVisit: '2024-01-16',
    quarter: 'Q1',
    householdNo: 'H002',
    familyNo: 'F002',
    householdHead: 'Charlz Dereck Arranchado',
    sitio: 'Purok 2',
    barangay: 'Cansaga',
    selectOne: 'Non-NHTS',
    typeOfWaterSource: '1-Point source',
    toiletFacility: 'B- connected to septic and sewarage system',
    typeOfWasteManagement: 'A - Waste Segragation',
    blincDrainage: true,
    renter: true,
    renterMonths: 12,
    familyMembers: [
      {
        id: '5',
        residentId: 'R-0005',
        firstName: 'Charlz',
        middleName: 'Dereck',
        lastName: 'Arranchado',
        dob: '1988-03-22',
        sex: 'Male',
        relationshipToHead: 'Head',
        civilStatus: 'Single',
        religion: 'Catholic',
        membershipType: 'Regular',
        philhealthId: 'PH-987654321',
        medicalHistory: 'None',
        smoker: true,
        alcoholicDrinker: true,
        sexuallyActive: false,
        fpUse: false,
        educationalAttainment: 'High School',
        ageHealthRiskGroup: 'Adult',
        remarks: 'Vaccinated',
      },
      {
        id: '6',
        residentId: 'R-0006',
        firstName: 'Roberto',
        middleName: 'Cruz',
        lastName: 'Arranchado',
        dob: '1965-12-10',
        sex: 'Male',
        relationshipToHead: 'Father',
        civilStatus: 'Widowed',
        religion: 'Catholic',
        membershipType: 'Senior',
        philhealthId: 'PH-987654322',
        medicalHistory: 'Diabetes, Hypertension',
        smoker: false,
        alcoholicDrinker: false,
        sexuallyActive: false,
        fpUse: false,
        educationalAttainment: 'Elementary',
        ageHealthRiskGroup: 'Senior',
        remarks: 'Vaccinated',
      },
      {
        id: '7',
        residentId: 'R-0007',
        firstName: 'Jessica',
        middleName: 'Torres',
        lastName: 'Arranchado',
        dob: '1992-07-18',
        sex: 'Female',
        relationshipToHead: 'Sister',
        civilStatus: 'Single',
        religion: 'Catholic',
        membershipType: 'Regular',
        philhealthId: 'PH-987654323',
        medicalHistory: 'None',
        smoker: false,
        alcoholicDrinker: false,
        sexuallyActive: false,
        lastMenstrualPeriod: '2024-01-08',
        ageOfMenarche: 14,
        fpUse: false,
        educationalAttainment: 'College',
        ageHealthRiskGroup: 'Adult',
        remarks: 'Vaccinated',
      },
    ],
  },
  {
    id: '3',
    householdId: 'HH-0003',
    dateOfVisit: '2024-01-17',
    quarter: 'Q1',
    householdNo: 'H003',
    familyNo: 'F003',
    householdHead: 'Prescious Mae Bugtai',
    sitio: 'Purok 3',
    barangay: 'Cansaga',
    selectOne: 'Non-NHTS',
    typeOfWaterSource: '1-Point source',
    toiletFacility: 'B- connected to septic and sewarage system',
    typeOfWasteManagement: 'A - Waste Segragation',
    blincDrainage: false,
    renter: false,
    familyMembers: [
      {
        id: '8',
        residentId: 'R-0008',
        firstName: 'Prescious',
        middleName: 'Mae',
        lastName: 'Bugtai',
        dob: '1995-07-08',
        sex: 'Female',
        relationshipToHead: 'Head',
        civilStatus: 'Single',
        religion: 'Catholic',
        membershipType: 'Regular',
        philhealthId: 'PH-456789123',
        medicalHistory: 'Asthma',
        smoker: false,
        alcoholicDrinker: false,
        sexuallyActive: false,
        lastMenstrualPeriod: '2024-01-05',
        ageOfMenarche: 12,
        fpUse: false,
        educationalAttainment: 'College',
        ageHealthRiskGroup: 'Adult',
        remarks: 'Not Vaccinated',
      },
      {
        id: '9',
        residentId: 'R-0009',
        firstName: 'Carmen',
        middleName: 'Lopez',
        lastName: 'Bugtai',
        dob: '1970-04-25',
        sex: 'Female',
        relationshipToHead: 'Mother',
        civilStatus: 'Widowed',
        religion: 'Catholic',
        membershipType: 'Regular',
        philhealthId: 'PH-456789124',
        medicalHistory: 'Hypertension',
        smoker: false,
        alcoholicDrinker: false,
        sexuallyActive: false,
        lastMenstrualPeriod: 'N/A',
        ageOfMenarche: 13,
        fpUse: false,
        educationalAttainment: 'High School',
        ageHealthRiskGroup: 'Adult',
        remarks: 'Vaccinated',
      },
      {
        id: '10',
        residentId: 'R-0010',
        firstName: 'Angelo',
        middleName: 'Bugtai',
        lastName: 'Bugtai',
        dob: '1998-09-15',
        sex: 'Male',
        relationshipToHead: 'Brother',
        civilStatus: 'Single',
        religion: 'Catholic',
        membershipType: 'Regular',
        philhealthId: 'PH-456789125',
        medicalHistory: 'None',
        smoker: true,
        alcoholicDrinker: true,
        sexuallyActive: true,
        fpUse: false,
        educationalAttainment: 'High School',
        ageHealthRiskGroup: 'Adult',
        remarks: 'Vaccinated',
      },
      {
        id: '11',
        residentId: 'R-0011',
        firstName: 'Liza',
        middleName: 'Reyes',
        lastName: 'Bugtai',
        dob: '2000-12-03',
        sex: 'Female',
        relationshipToHead: 'Sister',
        civilStatus: 'Single',
        religion: 'Catholic',
        membershipType: 'Regular',
        philhealthId: 'PH-456789126',
        medicalHistory: 'None',
        smoker: false,
        alcoholicDrinker: false,
        sexuallyActive: false,
        lastMenstrualPeriod: '2024-01-12',
        ageOfMenarche: 12,
        fpUse: false,
        educationalAttainment: 'College',
        ageHealthRiskGroup: 'Adult',
        remarks: 'Vaccinated',
      },
      {
        id: '12',
        residentId: 'R-0012',
        firstName: 'Pedro',
        middleName: 'Villanueva',
        lastName: 'Bugtai',
        dob: '2010-06-20',
        sex: 'Male',
        relationshipToHead: 'Nephew',
        civilStatus: 'Single',
        religion: 'Catholic',
        membershipType: 'Dependent',
        philhealthId: 'PH-456789127',
        medicalHistory: 'None',
        smoker: false,
        alcoholicDrinker: false,
        sexuallyActive: false,
        fpUse: false,
        educationalAttainment: 'Elementary',
        ageHealthRiskGroup: 'Child',
        remarks: 'Vaccinated',
      },
    ],
  },
];

const HouseholdCard = ({ household, onPress }: { household: Household; onPress: () => void }) => (
  <Pressable style={styles.householdCard} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={styles.avatarContainer}>
        <Ionicons name="home" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.cardInfo}>
        <ThemedText type="defaultSemiBold" style={styles.householdHead}>
          {household.householdHead}
        </ThemedText>
        <ThemedText style={styles.householdId}>ID: {household.householdId}</ThemedText>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <ThemedText style={styles.statusText}>Active</ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
    
    <View style={styles.cardDetails}>
      <View style={styles.detailItem}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>
          {new Date(household.dateOfVisit).toLocaleDateString()}
        </ThemedText>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="people-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText}>{household.familyMembers.length} members</ThemedText>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="location-outline" size={16} color="#6B7280" />
        <ThemedText style={styles.detailText} numberOfLines={1}>
          {household.sitio}, {household.barangay}
        </ThemedText>
      </View>
    </View>
  </Pressable>
);

const FamilyMemberCard = ({ member, onPress }: { member: FamilyMember; onPress: () => void }) => (
  <Pressable style={styles.memberCard} onPress={onPress}>
    <View style={styles.memberHeader}>
      <View style={styles.memberAvatarContainer}>
        <ThemedText style={styles.memberAvatarText}>
          {member.firstName[0]}{member.lastName[0]}
        </ThemedText>
      </View>
      <View style={styles.memberInfo}>
        <ThemedText type="defaultSemiBold" style={styles.memberName}>
          {member.firstName} {member.lastName}
        </ThemedText>
        <ThemedText style={styles.memberId}>ID: {member.residentId}</ThemedText>
        <ThemedText style={styles.memberRelation}>{member.relationshipToHead}</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
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

export default function HouseholdListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const filteredHouseholds = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return households;
    
    return households.filter(household =>
      household.householdId.toLowerCase().includes(query) ||
      household.householdHead.toLowerCase().includes(query) ||
      household.sitio.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const renderHousehold = ({ item }: { item: Household }) => (
    <HouseholdCard
      household={item}
      onPress={() => setSelectedHousehold(item)}
    />
  );

  const renderFamilyMember = ({ item }: { item: FamilyMember }) => (
    <FamilyMemberCard
      member={item}
      onPress={() => setSelectedMember(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Household List
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {filteredHouseholds.length} households found
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, household head, or location..."
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

      {/* Households List */}
      <FlatList
        data={filteredHouseholds}
        keyExtractor={(item) => item.id}
        renderItem={renderHousehold}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No households found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try adjusting your search terms
            </ThemedText>
          </View>
        }
      />

      {/* Household Details Modal */}
      <Modal
        visible={selectedHousehold !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedHousehold(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <View style={styles.modalAvatarContainer}>
                  <Ionicons name="home" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <ThemedText type="title" style={styles.modalTitle}>
                    {selectedHousehold?.householdHead}
                  </ThemedText>
                  <ThemedText style={styles.modalSubtitle}>
                    ID: {selectedHousehold?.householdId}
                  </ThemedText>
                </View>
              </View>
              <Pressable
                onPress={() => setSelectedHousehold(null)}
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
              {selectedHousehold && (
                <>
                  {/* Visit Information */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="calendar" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Visit Information
                      </ThemedText>
                    </View>
                    <View style={styles.sectionContent}>
                      <DetailRow label="Date of Visit" value={new Date(selectedHousehold.dateOfVisit).toLocaleDateString()} />
                      <DetailRow label="Quarter" value={selectedHousehold.quarter} />
                      <DetailRow label="Household No." value={selectedHousehold.householdNo} />
                      <DetailRow label="Family No." value={selectedHousehold.familyNo} isLast />
                    </View>
                  </View>

                  {/* Household Information */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="home" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Household Information
                      </ThemedText>
                    </View>
                    <View style={styles.sectionContent}>
                      <DetailRow label="Household Head" value={selectedHousehold.householdHead} />
                      <DetailRow label="Sitio/Purok" value={selectedHousehold.sitio} />
                      <DetailRow label="Barangay" value={selectedHousehold.barangay} />
                      <DetailRow label="Select One" value={selectedHousehold.selectOne} />
                      <DetailRow label="Type of Water Source" value={selectedHousehold.typeOfWaterSource} />
                      <DetailRow label="Toilet Facility" value={selectedHousehold.toiletFacility} />
                      <DetailRow label="Type of Waste Management" value={selectedHousehold.typeOfWasteManagement} />
                      <DetailRow label="Blinc Drainage" value={selectedHousehold.blincDrainage ? 'Yes' : 'No'} />
                      <DetailRow label="Renter" value={selectedHousehold.renter ? 'Yes' : 'No'} />
                      {selectedHousehold.renter && (
                        <DetailRow label="Renter Months" value={selectedHousehold.renterMonths?.toString() || 'N/A'} />
                      )}
                      <DetailRow label="Family Members" value={selectedHousehold.familyMembers.length.toString()} isLast />
                    </View>
                  </View>

                  {/* Family Members */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="people" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Family Members
                      </ThemedText>
                    </View>
                    <View style={styles.familyMembersContainer}>
                      <FlatList
                        data={selectedHousehold.familyMembers}
                        keyExtractor={(item) => item.id}
                        renderItem={renderFamilyMember}
                        scrollEnabled={false}
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Family Member Details Modal */}
      <Modal
        visible={selectedMember !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedMember(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <View style={styles.modalAvatarContainer}>
                  <ThemedText style={styles.modalAvatarText}>
                    {selectedMember?.firstName?.[0] || ''}{selectedMember?.lastName?.[0] || ''}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="title" style={styles.modalTitle}>
                    {selectedMember?.firstName} {selectedMember?.lastName}
                  </ThemedText>
                  <ThemedText style={styles.modalSubtitle}>
                    ID: {selectedMember?.residentId}
                  </ThemedText>
                </View>
              </View>
              <Pressable
                onPress={() => setSelectedMember(null)}
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
              {selectedMember && (
                <>
                  {/* Personal Information */}
                  <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="person" size={20} color="#FF3D33" />
                      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Personal Information
                      </ThemedText>
                    </View>
                    <View style={styles.sectionContent}>
                      <DetailRow label="First Name" value={selectedMember.firstName} />
                      <DetailRow label="Middle Name" value={selectedMember.middleName || 'N/A'} />
                      <DetailRow label="Last Name" value={selectedMember.lastName} />
                      <DetailRow label="Date of Birth" value={new Date(selectedMember.dob).toLocaleDateString()} />
                      <DetailRow label="Sex" value={selectedMember.sex} />
                      <DetailRow label="Relationship to Head" value={selectedMember.relationshipToHead} />
                      <DetailRow label="Civil Status" value={selectedMember.civilStatus} />
                      <DetailRow label="Religion" value={selectedMember.religion} isLast />
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
                      <DetailRow label="Membership Type" value={selectedMember.membershipType} />
                      <DetailRow label="PhilHealth ID" value={selectedMember.philhealthId || 'N/A'} />
                      <DetailRow label="Medical History" value={selectedMember.medicalHistory || 'None'} />
                      <DetailRow label="Smoker" value={selectedMember.smoker ? 'Yes' : 'No'} />
                      <DetailRow label="Alcoholic Drinker" value={selectedMember.alcoholicDrinker ? 'Yes' : 'No'} />
                      <DetailRow label="Sexually Active" value={selectedMember.sexuallyActive ? 'Yes' : 'No'} />
                      {selectedMember.sex === 'Female' && (
                        <>
                          <DetailRow label="Last Menstrual Period" value={selectedMember.lastMenstrualPeriod || 'N/A'} />
                          <DetailRow label="Age of Menarche" value={selectedMember.ageOfMenarche?.toString() || 'N/A'} />
                        </>
                      )}
                      <DetailRow label="FP Use" value={selectedMember.fpUse ? 'Yes' : 'No'} />
                      <DetailRow label="Educational Attainment" value={selectedMember.educationalAttainment} />
                      <DetailRow label="Age/Health Risk Group" value={selectedMember.ageHealthRiskGroup} />
                      <DetailRow label="Remarks" value={selectedMember.remarks} isLast />
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
  householdCard: {
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
  householdHead: {
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
    backgroundColor: '#10B981',
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
  memberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3D33',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  memberId: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberRelation: {
    fontSize: 10,
    color: '#9CA3AF',
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
  familyMembersContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
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