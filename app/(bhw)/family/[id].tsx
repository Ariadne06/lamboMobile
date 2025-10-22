import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  BackHandler,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native';
import { getUserSession } from '@/utils/session';

interface FamilyMember {
  family_member_id: number;
  full_name: string;
  has_gh: number;
}

interface FamilyDetail {
  family_id: number;
  family_code: string;
  household_id: number;
  fam_head_full_name: string;
  respondent_full_name: string;
  respondent_rtf_name: string;
  family_head_id: number;
  respondent_id: number;
  relationship_of_family_head_to_hh: string;
  relationship_of_family_head_to_hh_id: number;
  respondent_rtf_id: number;
  nhts_status: boolean;
  ip_status: boolean;
  ip_tribe?: string;
  household_type: string;
  household_type_id: number;
  water_source_name: string;
  water_source_type_id: number;
  toilet_facility_name: string;
  toilet_facility_type_id: number;
  waste_management_name: string;
  waste_management_type_id: number;
  is_visited: boolean;
  date_visited?: string;
  visited_by_full_name?: string;
  is_active: boolean;
  quarter_id: number;
  members_json: FamilyMember[];
}

// Modern, harmonized theme
const theme = {
  colors: {
    // Base colors
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    
    // Primary palette
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    primaryDark: '#1E40AF',
    
    // Status colors
    success: '#059669',
    successLight: '#ECFDF5',
    successBorder: '#BBF7D0',
    
    warning: '#D97706',
    warningLight: '#FEF3C7',
    warningBorder: '#FDE68A',
    
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    
    info: '#0891B2',
    infoLight: '#E0F7FA',
    
    // Text colors
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textLight: '#94A3B8',
    
    // Special status colors
    nhts: '#7C3AED',
    ip: '#EA580C',
    inactive: '#9CA3AF',
  },
  
  spacing: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
  },
  
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    pill: 9999,
  },
  
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    }
  }
};

export default function FamilyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const [family, setFamily] = useState<FamilyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingVisit, setMarkingVisit] = useState(false);
  const [ghReadiness, setGhReadiness] = useState<any>(null);
  const [checkingReadiness, setCheckingReadiness] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Family detail screen focused - fetching latest data');
      setLoading(true);
      fetchFamilyDetails();
      return () => {};
    }, [id])
  );

  const handleBackPress = () => {
    if (family?.household_id) {
      router.push(`/(bhw)/household/${family.household_id}` as any);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(bhw)/menu/viewhousehold');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [family])
  );

  const fetchFamilyDetails = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(
        `${API_BASE_URL}/household_api/families/${id}/details/?t=${timestamp}`
      );
      const data = await response.json();

      if (data?.success) {
        const familyData: FamilyDetail = {
          ...data.data,
          members_json: Array.isArray(data.data?.members_json) 
            ? data.data.members_json 
            : [],
        };
        setFamily(familyData);
        
        console.log('Family data refreshed:', {
          family_id: familyData.family_id,
          members_count: familyData.members_json?.length || 0,
          members_with_gh: familyData.members_json?.filter(m => m.has_gh === 1).length || 0
        });
      } else {
        Alert.alert('Error', data?.message || 'Failed to load family details');
      }
    } catch (error) {
      console.error('Error fetching family:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFamilyDetails();
  };

  const checkGHReadiness = async () => {
    setCheckingReadiness(true);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/household_api/families/${id}/gh-readiness/`
      );
      const data = await response.json();

      console.log('GH Readiness Response:', JSON.stringify(data, null, 2));

      if (data.success && data.data) {
        const readinessData = {
          ready: data.data.ready === true,
          total_members: parseInt(data.data.total_members) || 0,
          missing_count: parseInt(data.data.missing_count) || 0,
          missing_members: data.data.missing_members || []
        };
        
        console.log('Parsed GH Readiness:', readinessData);
        setGhReadiness(readinessData);
      } else {
        console.error('Invalid GH readiness response:', data);
        setGhReadiness({
          ready: false,
          total_members: 0,
          missing_count: 0,
          missing_members: []
        });
      }
    } catch (error) {
      console.error('Error checking readiness:', error);
      setGhReadiness(null);
    } finally {
      setCheckingReadiness(false);
    }
  };

  useEffect(() => {
    if (family) {
      console.log('Family loaded, checking GH readiness...');
      checkGHReadiness();
    }
  }, [family]);

  const handleMarkFamilyVisited = async () => {
    try {
      const session = await getUserSession();
      if (!session) {
        Alert.alert('Error', 'User session not found');
        return;
      }

      if (!ghReadiness?.ready) {
        const missingCount = ghReadiness?.missing_count || 0;
        Alert.alert(
          'Cannot Mark as Visited',
          `${missingCount} member(s) are missing General Health data for the current quarter.\n\nPlease ensure all family members have their General Health records completed before marking this family as visited.`,
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Confirm Visit',
        'Mark this family as visited?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark Visited',
            onPress: async () => {
              setMarkingVisit(true);
              
              try {
                const response = await fetch(
                  `${API_BASE_URL}/household_api/families/${id}/mark-visited/`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      personnel_id: session.user_id,
                      enforce_bhw_assignment: false,
                    }),
                  }
                );

                const data = await response.json();

                if (data.success) {
                  Alert.alert('Success', 'Family marked as visited!');
                  fetchFamilyDetails();
                } else {
                  if (data.error === 'incomplete_gh') {
                    Alert.alert(
                      'Incomplete Data',
                      data.message,
                      [{ text: 'OK' }]
                    );
                  } else {
                    Alert.alert('Error', data.message || 'Failed to mark as visited');
                  }
                }
              } catch (error) {
                console.error('Error:', error);
                Alert.alert('Error', 'Network error. Please try again.');
              } finally {
                setMarkingVisit(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Family Details" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
          <ThemedText style={styles.loadingText}>Loading family details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Not found state
  if (!family) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Family Details" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textLight} />
          </View>
          <ThemedText style={styles.emptyTitle}>Family not found</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            This family may have been removed or the ID is invalid.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Derived data
  const members = family.members_json || [];
  const totalMembers = members.length;
  const membersWithGH = members.filter((m) => m?.has_gh === 1).length;
  const membersWithoutGH = totalMembers - membersWithGH;
  const ghPct = totalMembers > 0 ? Math.round((membersWithGH / totalMembers) * 100) : 0;
  
  // Sort members to show those missing GH first
  const sortedMembers = [...members].sort((a, b) => {
    if ((a?.has_gh === 0 || a?.has_gh === null) && b?.has_gh === 1) return -1;
    if (a?.has_gh === 1 && (b?.has_gh === 0 || b?.has_gh === null)) return 1;
    return 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Family Details" onBackPress={handleBackPress} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      >
        {/* 1. FAMILY OVERVIEW */}
        <View style={styles.overviewCard}>
          {/* Header with status badges */}
          <View style={styles.overviewHeader}>
            <View style={styles.titleSection}>
              <View style={styles.titleIcon}>
                <Ionicons name="home-outline" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <ThemedText style={styles.familyCode}>{family.family_code}</ThemedText>
                <ThemedText style={styles.familySubtitle}>Family Overview</ThemedText>
              </View>
            </View>
            
            <View style={styles.statusBadges}>
              {family.nhts_status && (
                <View style={[styles.statusBadge, styles.nhtsBadge]}>
                  <MaterialCommunityIcons name="shield-account" size={12} color="#FFFFFF" />
                  <ThemedText style={styles.badgeText}>NHTS</ThemedText>
                </View>
              )}
              {family.ip_status && (
                <View style={[styles.statusBadge, styles.ipBadge]}>
                  <Ionicons name="people-outline" size={12} color="#FFFFFF" />
                  <ThemedText style={styles.badgeText} numberOfLines={1} ellipsizeMode="tail">
                    IP{family.ip_tribe ? ` - ${family.ip_tribe}` : ''}
                  </ThemedText>
                </View>
              )}
              {!family.is_active && (
                <View style={[styles.statusBadge, styles.inactiveBadge]}>
                  <Ionicons name="pause-outline" size={12} color="#FFFFFF" />
                  <ThemedText style={styles.badgeText}>Inactive</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Quick stats - more compact */}
          <View style={styles.quickStatsList}>
           
            <View style={styles.quickStatRow}>
              <View style={styles.statRowLeft}>
                <View style={[styles.statIconSmall, { backgroundColor: theme.colors.infoLight }]}>
                  <Ionicons name="business-outline" size={12} color={theme.colors.info} />
                </View>
                <ThemedText style={styles.statRowLabel}>Household Type</ThemedText>
              </View>
              <ThemedText style={styles.statRowValue} numberOfLines={2} ellipsizeMode="tail">
                {family.household_type || 'Not specified'}
              </ThemedText>
            </View>

            
            <View style={styles.quickStatRow}>
              <View style={styles.statRowLeft}>
                <View style={[styles.statIconSmall, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name="people-outline" size={12} color={theme.colors.primary} />
                </View>
                <ThemedText style={styles.statRowLabel}>Member(s)</ThemedText>
              </View>
              <ThemedText style={styles.statRowValue}>{totalMembers}</ThemedText>
            </View>

           
            <View style={styles.quickStatRow}>
              <View style={styles.statRowLeft}>
                <View style={[
                  styles.statIconSmall, 
                  { backgroundColor: family.is_visited ? theme.colors.successLight : theme.colors.warningLight }
                ]}>
                  <Ionicons
                    name={family.is_visited ? "checkmark-circle-outline" : "time-outline"}
                    size={12}
                    color={family.is_visited ? theme.colors.success : theme.colors.warning}
                  />
                </View>
                <ThemedText style={styles.statRowLabel}>Visit Status</ThemedText>
              </View>
              <ThemedText style={[
                styles.statRowValue,
                { color: family.is_visited ? theme.colors.success : theme.colors.warning }
              ]}>
                {family.is_visited ? 'Completed' : 'Pending'}
              </ThemedText>
            </View>
          </View>

          {/* GH Progress */}
          {totalMembers > 0 && (
            <View style={styles.ghProgress}>
              <View style={styles.ghHeader}>
                <View style={styles.ghTitleSection}>
                  <Ionicons name="medical-outline" size={16} color={theme.colors.success} />
                  <ThemedText style={styles.ghTitle}>General Health</ThemedText>
                </View>
                <ThemedText style={[
                  styles.ghFraction,
                  { 
                    color: membersWithGH === totalMembers 
                      ? theme.colors.success 
                      : theme.colors.warning 
                  }
                ]}>
                  {membersWithGH}/{totalMembers}
                </ThemedText>
              </View>
              
              <View style={styles.progressBar}>
                <View style={styles.progressTrack}>
                  <View style={[
                    styles.progressFill,
                    { 
                      width: `${ghPct}%`,
                      backgroundColor: ghPct === 100 ? theme.colors.success : theme.colors.warning
                    }
                  ]} />
                </View>
                <ThemedText style={styles.progressPercent}>{ghPct}%</ThemedText>
              </View>
              
              {membersWithoutGH > 0 && (
                <ThemedText style={styles.ghHint}>
                  {membersWithoutGH} member{membersWithoutGH !== 1 ? 's' : ''} need GH records
                </ThemedText>
              )}
            </View>
          )}
        </View>

        {/* 2. FAMILY DETAILS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Family Details
            </ThemedText>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailGroup}>
              <ThemedText style={styles.detailGroupTitle}>Family Head</ThemedText>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Name</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                  {family.fam_head_full_name || 'Not assigned'}
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Relationship to HH Head</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                  {family.relationship_of_family_head_to_hh || 'Not specified'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailGroup}>
              <ThemedText style={styles.detailGroupTitle}>Respondent</ThemedText>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Name</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                  {family.respondent_full_name || 'Not assigned'}
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Relationship to Family Head</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                  {family.respondent_rtf_name || 'Not specified'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* 3. FACILITIES & SANITATION */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.colors.infoLight }]}>
              <Ionicons name="home-outline" size={20} color={theme.colors.info} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.info }]}>
              Facilities & Sanitation
            </ThemedText>
          </View>

          <View style={styles.facilitiesList}>
            <View style={styles.facilityItem}>
              <View style={styles.facilityIcon}>
                <Ionicons name="water-outline" size={18} color={theme.colors.info} />
              </View>
              <View style={styles.facilityContent}>
                <ThemedText style={styles.facilityLabel}>Water Source</ThemedText>
                <ThemedText style={styles.facilityValue} numberOfLines={1} ellipsizeMode="tail">
                  {family.water_source_name || 'Not specified'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.facilityItem}>
              <View style={styles.facilityIcon}>
                <MaterialCommunityIcons name="toilet" size={18} color={theme.colors.info} />
              </View>
              <View style={styles.facilityContent}>
                <ThemedText style={styles.facilityLabel}>Toilet Facility</ThemedText>
                <ThemedText style={styles.facilityValue} numberOfLines={1} ellipsizeMode="tail">
                  {family.toilet_facility_name || 'Not specified'}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.facilityItem, { borderBottomWidth: 0 }]}>
              <View style={styles.facilityIcon}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.info} />
              </View>
              <View style={styles.facilityContent}>
                <ThemedText style={styles.facilityLabel}>Waste Management</ThemedText>
                <ThemedText style={styles.facilityValue} numberOfLines={1} ellipsizeMode="tail">
                  {family.waste_management_name || 'Not specified'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

         {/* 4. FAMILY MEMBERS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="people-outline" size={20} color={theme.colors.success} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.success }]}>
              Family Members ({totalMembers})
            </ThemedText>
            
            <Pressable
              style={styles.addButton}
              onPress={() => router.push(`/(bhw)/family/${id}/add-member` as any)}
              hitSlop={8}
            >
              <Ionicons name="add-circle-outline" size={22} color={theme.colors.success} />
            </Pressable>
          </View>

          {sortedMembers.length > 0 ? (
            <View style={styles.membersList}>
              {sortedMembers.map((member, index) => (
                <Pressable
                  key={member?.family_member_id ?? index}
                  style={[
                    styles.memberItem,
                    index !== sortedMembers.length - 1 && styles.memberDivider,
                  ]}
                  onPress={() =>
                    router.push(`/(bhw)/family/${id}/member/${member.family_member_id}/` as any)
                  }
                >
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                    </View>
                    <ThemedText style={styles.memberName} numberOfLines={1} ellipsizeMode="tail">
                      {member?.full_name || 'Unknown'}
                    </ThemedText>
                  </View>

                  <View style={[
                    styles.ghStatusPill,
                    member?.has_gh === 1 ? styles.ghCompletePill : styles.ghIncompletePill
                  ]}>
                    <ThemedText style={[
                      styles.ghStatusText,
                      member?.has_gh === 1 ? styles.ghCompleteText : styles.ghIncompleteText
                    ]}>
                      {member?.has_gh === 1 ? 'GH' : 'No GH'}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyMembers}>
              <View style={styles.emptyMembersIcon}>
                <Ionicons name="person-add-outline" size={40} color={theme.colors.textLight} />
              </View>
              <ThemedText style={styles.emptyMembersTitle}>No members added</ThemedText>
              <ThemedText style={styles.emptyMembersSubtitle}>
                Add family members to complete the profile
              </ThemedText>
            </View>
          )}
        </View>

        {/* 5. VISIT MANAGEMENT */}
        <View style={styles.sectionCard}>
          {family.is_visited ? (
            // Visited state
            <View style={styles.visitedSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                </View>
                <ThemedText style={[styles.sectionTitle, { color: theme.colors.success }]}>
                  Visit Completed
                </ThemedText>
              </View>
              
              <View style={styles.visitDetails}>
                <View style={styles.visitDetailItem}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.success} />
                  <View style={styles.visitDetailContent}>
                    <ThemedText style={styles.visitDetailLabel}>Date</ThemedText>
                    <ThemedText style={styles.visitDetailValue} numberOfLines={2} ellipsizeMode="tail">
                      {family.date_visited
                        ? new Date(family.date_visited).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Not available'}
                    </ThemedText>
                  </View>
                </View>

                {family.visited_by_full_name && (
                  <View style={styles.visitDetailItem}>
                    <Ionicons name="person-outline" size={16} color={theme.colors.success} />
                    <View style={styles.visitDetailContent}>
                      <ThemedText style={styles.visitDetailLabel}>Visited by</ThemedText>
                      <ThemedText style={styles.visitDetailValue} numberOfLines={1} ellipsizeMode="tail">
                        {family.visited_by_full_name}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : (
            // Not visited state
            <View style={styles.markVisitSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                </View>
                <ThemedText style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Mark Visit
                </ThemedText>
              </View>

              {checkingReadiness ? (
                <View style={styles.checkingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <ThemedText style={styles.checkingText}>Checking readiness...</ThemedText>
                </View>
              ) : (
                <>
                  {ghReadiness && (
                    <View style={styles.readinessContainer}>
                      <View style={styles.readinessHeader}>
                        <Ionicons 
                          name={ghReadiness.ready ? "shield-checkmark-outline" : "alert-circle-outline"} 
                          size={16} 
                          color={ghReadiness.ready ? theme.colors.success : theme.colors.danger}
                        />
                        <ThemedText style={[
                          styles.readinessText,
                          { color: ghReadiness.ready ? theme.colors.success : theme.colors.danger }
                        ]}>
                          {ghReadiness.ready ? 'Ready to mark as visited' : 'Cannot mark as visited'}
                        </ThemedText>
                      </View>
                      
                      {!ghReadiness.ready && (
                        <View style={styles.warningContainer}>
                          <Ionicons name="information-circle-outline" size={14} color={theme.colors.warning} />
                          <ThemedText style={styles.warningText}>
                            Complete GH records for all members first
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  )}

                  <Pressable
                    style={[
                      styles.markVisitButton,
                      (!ghReadiness?.ready || markingVisit) && styles.markVisitButtonDisabled
                    ]}
                    onPress={handleMarkFamilyVisited}
                    disabled={!ghReadiness?.ready || markingVisit}
                  >
                    {markingVisit ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name={ghReadiness?.ready ? "checkmark-circle-outline" : "lock-closed-outline"}
                          size={18}
                          color="#FFFFFF"
                        />
                        <ThemedText style={styles.markVisitButtonText}>
                          {ghReadiness?.ready ? 'Mark as Visited' : 'Complete GH Data First'}
                        </ThemedText>
                      </>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Base layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  bottomSpacer: {
    height: theme.spacing.xxxl,
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
  loadingSpinner: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.md,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Overview card
  overviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadow.md,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    flex: 1,
  },
  titleIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  familyCode: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  familySubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },

  // Status badges
  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    gap: 4,
  },
  nhtsBadge: {
    backgroundColor: theme.colors.nhts,
  },
  ipBadge: {
    backgroundColor: theme.colors.ip,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.inactive,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 80,
  },

  // Quick stats
  quickStats: {
  flexDirection: 'row',
  gap: theme.spacing.md, // Reduced from lg
  marginBottom: theme.spacing.lg, // Reduced from xl
  },
  quickStatsColumn: {
    flexDirection: 'column',
    gap: theme.spacing.md, // Reduced from lg
  },
  quickStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.md, // Reduced from lg
    padding: theme.spacing.md, // Reduced from lg
    gap: theme.spacing.md, // Reduced from lg
    minHeight: 50, // Added fixed height for consistency
  },
  statIcon: {
    width: 24, // Reduced from 32
    height: 24, // Reduced from 32
    borderRadius: theme.radius.sm, // Reduced from md
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0, // Prevent shrinking
  },
  statContent: {
    flex: 1,
    minWidth: 0, // Allow text truncation
  },
  statValue: {
    fontSize: 14, // Reduced from 16
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 1, // Reduced from 2
  },
  statLabel: {
    fontSize: 10, // Reduced from 11
    color: theme.colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
  },

  // GH Progress
  ghProgress: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  ghHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  ghTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ghTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  ghFraction: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.pill,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },
  ghHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },

  // Section cards
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadow.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  addButton: {
    padding: theme.spacing.sm,
  },

  // Visit sections
  visitedSection: {},
  visitDetails: {
    gap: theme.spacing.lg,
  },
  visitDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    gap: theme.spacing.lg,
  },
  visitDetailContent: {
    flex: 1,
  },
  visitDetailLabel: {
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  visitDetailValue: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '500',
  },

  markVisitSection: {},
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  checkingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  readinessContainer: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  readinessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  readinessText: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.warningLight,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
  },
  warningText: {
    fontSize: 12,
    color: theme.colors.warning,
    flex: 1,
  },

  markVisitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  markVisitButtonDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  markVisitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Members list
  membersList: {
    gap: 2,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
  },
  memberDivider: {
    marginBottom: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    flex: 1,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  ghStatusPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
  },
  ghCompletePill: {
    backgroundColor: theme.colors.successLight,
  },
  ghIncompletePill: {
    backgroundColor: theme.colors.warningLight,
  },
  ghStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ghCompleteText: {
    color: theme.colors.success,
  },
  ghIncompleteText: {
    color: theme.colors.warning,
  },

  // Empty members
  emptyMembers: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyMembersIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyMembersTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  emptyMembersSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },

  // Details grid
  detailsGrid: {
    gap: theme.spacing.xl,
  },
  detailGroup: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  detailGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.lg,
  },
  detailItem: {
    marginBottom: theme.spacing.lg,
  },
  detailLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },

  // Facilities list
  facilitiesList: {
    gap: 2,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  facilityIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  facilityContent: {
    flex: 1,
  },
  facilityLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  facilityValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },

  keyStatsRow: {
  flexDirection: 'row',
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.xl,
},
keyStatCard: {
  flex: 1,
  backgroundColor: theme.colors.borderLight,
  borderRadius: theme.radius.lg,
  padding: theme.spacing.lg,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 70,
},
keyStatNumber: {
  fontSize: 20,
  fontWeight: '800',
  color: theme.colors.textPrimary,
  marginBottom: 2,
},
keyStatLabel: {
  fontSize: 11,
  color: theme.colors.textMuted,
  fontWeight: '600',
  textAlign: 'center',
  textTransform: 'uppercase',
},

// Info items
infoItems: {
  gap: theme.spacing.sm,
},
infoItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.colors.borderLight,
  paddingVertical: theme.spacing.lg,
  paddingHorizontal: theme.spacing.xl,
  borderRadius: theme.radius.lg,
},
infoItemLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.lg,
  flex: 1,
},
infoItemLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: theme.colors.textSecondary,
},
infoItemValue: {
  fontSize: 14,
  fontWeight: '600',
  color: theme.colors.textPrimary,
  textAlign: 'right',
  flex: 1,
  marginLeft: theme.spacing.lg,
},

// Alternative horizontal cards
quickStatsHorizontal: {
  flexDirection: 'row',
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
},
quickStatCard: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.borderLight,
  borderRadius: theme.radius.lg,
  padding: theme.spacing.lg,
  gap: theme.spacing.lg,
},
statIconLarge: {
  width: 32,
  height: 32,
  borderRadius: theme.radius.md,
  justifyContent: 'center',
  alignItems: 'center',
},
statTextSection: {
  flex: 1,
},
statValueLarge: {
  fontSize: 16,
  fontWeight: '700',
  color: theme.colors.textPrimary,
  marginBottom: 1,
},
statLabelLarge: {
  fontSize: 11,
  color: theme.colors.textMuted,
  fontWeight: '500',
  textTransform: 'uppercase',
},

// Household type bar
householdTypeBar: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.borderLight,
  borderRadius: theme.radius.lg,
  padding: theme.spacing.lg,
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
},
householdTypeContent: {
  flex: 1,
},
householdTypeLabel: {
  fontSize: 11,
  color: theme.colors.textMuted,
  fontWeight: '500',
  textTransform: 'uppercase',
  marginBottom: 2,
},
householdTypeValue: {
  fontSize: 14,
  fontWeight: '600',
  color: theme.colors.textPrimary,
  lineHeight: 18,
},

// Vertical list style
quickStatsList: {
  backgroundColor: theme.colors.borderLight,
  borderRadius: theme.radius.lg,
  padding: theme.spacing.lg,
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
},
quickStatRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
statRowLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  flex: 1,
},
statDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
},
statRowLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: theme.colors.textSecondary,
},
statRowValue: {
  fontSize: 14,
  fontWeight: '700',
  color: theme.colors.textPrimary,
  textAlign: 'right',
  flex: 1,
  marginLeft: theme.spacing.lg,
},
statIconSmall: {
  width: 20,
  height: 20,
  borderRadius: theme.radius.sm,
  justifyContent: 'center',
  alignItems: 'center',
  flexShrink: 0,
},
});