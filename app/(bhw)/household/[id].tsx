import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native'; 

interface HouseholdDetail {
  household_id: number;
  household_number: string;
  house_ownership: string;
  house_type: string;
  household_head: string;
  respondent: string;
  full_address: string;
  is_visited: boolean;
  date_visited: string | null;
  is_active: boolean;
  families_count: number;
  members_count: number;
}

interface Family {
  family_id: number;
  family_code: string;
  family_head: string;
  respondent_name: string;
  respondent_relationship: string;
  household_type: string;
  nhts_status: boolean;
  indigent: boolean; 
  water_source?: string;    
  toilet_facility?: string;
  waste_management?: string;
  family_members: string | Array<{  
    full_name: string;
    has_gh: number;  
  }>;
}

export default function HouseholdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [household, setHousehold] = useState<HouseholdDetail | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHouseholdDetails();
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Household detail screen focused - fetching latest data');
      fetchHouseholdDetails();
      return () => {};
    }, [id])
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.push('/(bhw)/menu/viewhousehold');
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [router])
  );

  const fetchHouseholdDetails = async () => {
  try {
    // Fetch household details
    const hhResponse = await fetch(
      `${API_BASE_URL}/household_api/households/${id}/details/`
    );
    const hhData = await hhResponse.json();

    if (hhData.success) {
      setHousehold(hhData.data);
    }

    // Fetch families for this household
    const famResponse = await fetch(
      `${API_BASE_URL}/household_api/households/${id}/families/`
    );
    const famData = await famResponse.json();

    if (famData.success) {
      //  Parse family_members if it's a string (JSONB from SQL)
      const parsedFamilies = (famData.data || []).map((family: any) => {
        // Parse family_members if it's a string
        let members = family.family_members;
        if (typeof members === 'string') {
          try {
            members = JSON.parse(members);
          } catch (e) {
            console.error('Failed to parse family_members:', e);
            members = [];
          }
        }
        
        // Ensure it's always an array
        if (!Array.isArray(members)) {
          members = [];
        }

        return {
          ...family,
          family_members: members
        };
      });

      setFamilies(parsedFamilies);
    }
  } catch (error) {
    console.error('Error fetching household details:', error);
    Alert.alert('Error', 'Failed to load household details');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const handleBackPress = () => {
    router.push('/(bhw)/menu/viewhousehold');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHouseholdDetails();
  };

  const handleAddFamily = () => {
    router.push(`/(bhw)/household/${id}/add-family` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Household Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
        </View>
      </SafeAreaView>
    );
  }

  if (!household) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Household Details" />
        <View style={styles.emptyContainer}>
          <ThemedText>Household not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
       <CustomHeader 
        title={household?.household_number || 'Household Details'} 
        onBackPress={handleBackPress}
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF3D33']}
          />
        }
      >
        {/* Household Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="home" size={24} color="#FF3D33" />
            <ThemedText style={styles.cardTitle}>Household Information</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Head:</ThemedText>
            <ThemedText style={styles.value}>{household.household_head || 'Not assigned'}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Address:</ThemedText>
            <ThemedText style={styles.value}>{household.full_address}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Ownership:</ThemedText>
            <ThemedText style={styles.value}>{household.house_ownership}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Type:</ThemedText>
            <ThemedText style={styles.value}>{household.house_type}</ThemedText>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statNumber}>{household.families_count}</ThemedText>
              <ThemedText style={styles.statLabel}>Families</ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statNumber}>{household.members_count}</ThemedText>
              <ThemedText style={styles.statLabel}>Members</ThemedText>
            </View>
          </View>
        </View>

        {/* Families Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Families ({families.length})</ThemedText>
          <Pressable style={styles.addButton} onPress={handleAddFamily}>
            <Ionicons name="add-circle" size={24} color="#FF3D33" />
          </Pressable>
        </View>

        {families.map((family) => (
          <Pressable
            key={family.family_id}
            style={styles.familyCard}
            onPress={() => {
              router.push(`/(bhw)/family/${family.family_id}` as any);
            }}
          >
            {/* Header Section */}
            <View style={styles.familyHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.familyCodeRow}>
                  <ThemedText style={styles.familyCode}>{family.family_code}</ThemedText>
                  <View style={styles.householdTypeBadge}>
                    <ThemedText style={styles.householdTypeText}>
                      {family.household_type || 'N/A'}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.headInfo}>
                  <Ionicons name="person" size={14} color="#6B7280" />
                  <ThemedText style={styles.familyHead}>
                    {family.family_head}
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>

            {/* Status Badges */}
            <View style={styles.familyBadges}>
              {family.nhts_status && (
                <View style={styles.nhtsBadge}>
                  <MaterialCommunityIcons name="target-account" size={12} color="#FFFFFF" />
                  <ThemedText style={styles.badgeText}>NHTS</ThemedText>
                </View>
              )}
              {family.indigent && (
                <View style={styles.ipBadge}>
                  <Ionicons name="people" size={12} color="#FFFFFF" />
                  <ThemedText style={styles.badgeText}>Indigent</ThemedText>
                </View>
              )}
            </View>

            {/* Members Summary */}
            <View style={styles.membersSummary}>  
              <View style={styles.membersCount}>
                <Ionicons name="people-outline" size={16} color="#0ea5e9" />
                <ThemedText style={styles.membersCountText}>
                  {Array.isArray(family.family_members) ? family.family_members.length : 0} Member/s
                </ThemedText>
              </View>
              
              {/* General Health Coverage */}
              {Array.isArray(family.family_members) && family.family_members.length > 0 && (
                <View style={styles.philhealthInfo}>
                  <Ionicons 
                    name="medical" 
                    size={14} 
                    color={
                      family.family_members.filter(m => m.has_gh === 1).length > 0 
                        ? '#10B981' 
                        : '#9CA3AF'
                    } 
                  />
                  <ThemedText style={styles.philhealthText}>
                    {family.family_members.filter(m => m.has_gh === 1).length}/
                    {family.family_members.length} with GH
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Members List Preview (First 3) */}
            {Array.isArray(family.family_members) && family.family_members.length > 0 && (
              <View style={styles.membersPreview}>
                {family.family_members.slice(0, 3).map((member, index) => (
                  <View key={index} style={styles.memberItem}>
                    <Ionicons 
                      name="person" 
                      size={12} 
                      color="#6B7280" 
                    />
                    <ThemedText style={styles.memberName} numberOfLines={1}>
                      {member.full_name}
                    </ThemedText>
                    {member.has_gh === 1 && (
                      <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    )}
                  </View>
                ))}
                {family.family_members.length > 3 && (
                  <ThemedText style={styles.moreMembers}>
                    +{family.family_members.length - 3} more
                  </ThemedText>
                )}
              </View>
            )}

            {/* Facilities Info (Optional - if provided by backend) */}
            {(family.water_source || family.toilet_facility) && (
              <View style={styles.facilitiesInfo}>
                {family.water_source && (
                  <View style={styles.facilityItem}>
                    <Ionicons name="water" size={12} color="#0ea5e9" />
                    <ThemedText style={styles.facilityText}>{family.water_source}</ThemedText>
                  </View>
                )}
                {family.toilet_facility && (
                  <View style={styles.facilityItem}>
                    <Ionicons name="home" size={12} color="#0ea5e9" />
                    <ThemedText style={styles.facilityText}>{family.toilet_facility}</ThemedText>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        ))}

        {families.length === 0 && (
          <View style={styles.emptyFamilies}>
            <ThemedText style={styles.emptyText}>No families registered yet</ThemedText>
            <Pressable style={styles.addFamilyButton} onPress={handleAddFamily}>
              <ThemedText style={styles.addFamilyText}>Add First Family</ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3D33',
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF3D33',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  addButton: {
    padding: 4,
  },
  familyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  familyCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3D33',
  },
  familyHead: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  familyBadges: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  badge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  indigentBadge: {
    backgroundColor: '#F59E0B',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyFamilies: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  addFamilyButton: {
    backgroundColor: '#FF3D33',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFamilyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
    familyCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  householdTypeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  householdTypeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  headInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nhtsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  membersSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  membersCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  membersCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  philhealthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  philhealthText: {
    fontSize: 12,
    color: '#6B7280',
  },
  membersPreview: {
    marginTop: 8,
    gap: 6,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  memberName: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  moreMembers: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  facilitiesInfo: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  facilityText: {
    fontSize: 11,
    color: '#6B7280',
  },
});