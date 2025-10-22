import React, { useState, useEffect, useCallback, memo } from 'react';
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

// ✅ Memoized Family Card Component for Performance
const FamilyCard = memo(({ 
  family, 
  onPress 
}: { 
  family: Family; 
  onPress: (id: number) => void;
}) => {
  const ghStats = React.useMemo(() => {
    const members = Array.isArray(family.family_members) 
      ? family.family_members 
      : [];
    const totalMembers = members.length;
    const membersWithGH = members.filter(m => m.has_gh === 1).length;
    const ghPercentage = totalMembers > 0 ? Math.round((membersWithGH / totalMembers) * 100) : 0;
    
    return { totalMembers, membersWithGH, ghPercentage };
  }, [family.family_members]);

  return (
    <Pressable 
      style={styles.familyCard}
      onPress={() => onPress(family.family_id)}
      android_ripple={{ color: '#F3F4F6' }}
    >
      {/* Family Header */}
      <View style={styles.familyHeader}>
        <View style={styles.familyInfo}>
          <View style={styles.familyCodeRow}>
            <ThemedText style={styles.familyCode}>{family.family_code}</ThemedText>
            <View style={styles.householdTypeBadge}>
              <ThemedText style={styles.householdTypeText}>
                {family.household_type}
              </ThemedText>
            </View>
          </View>
          <View style={styles.headInfo}>
            <Ionicons name="person" size={14} color={theme.colors.textMuted} />
            <ThemedText style={styles.familyHead} numberOfLines={1}>
              Head: {family.family_head || 'Not assigned'}
            </ThemedText>
          </View>
        </View>
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
            <ThemedText style={styles.badgeText}>IP</ThemedText>
          </View>
        )}
      </View>

      {/* Members Summary */}
      <View style={styles.membersSummary}>
        <View style={styles.membersCount}>
          <Ionicons name="people-outline" size={16} color={theme.colors.info} />
          <ThemedText style={styles.membersCountText}>
            {ghStats.totalMembers} member{ghStats.totalMembers !== 1 ? 's' : ''}
          </ThemedText>
        </View>
        <View style={styles.ghInfo}>
          <ThemedText style={[
            styles.ghText,
            { color: ghStats.ghPercentage === 100 ? theme.colors.success : theme.colors.warning }
          ]}>
            {ghStats.ghPercentage}% GH
          </ThemedText>
          <Ionicons 
            name={ghStats.ghPercentage === 100 ? "checkmark-circle" : "alert-circle"} 
            size={14} 
            color={ghStats.ghPercentage === 100 ? theme.colors.success : theme.colors.warning}
          />
        </View>
      </View>

      {/* Members Preview */}
      {ghStats.totalMembers > 0 && (
        <View style={styles.membersPreview}>
          {Array.isArray(family.family_members) && 
          family.family_members.slice(0, 3).map((member, index) => (
            <View key={index} style={styles.memberItem}>
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={12} color={theme.colors.textMuted} />
              </View>
              <ThemedText style={styles.memberName} numberOfLines={1}>
                {member.full_name}
              </ThemedText>
              <View style={styles.ghBadge}>
                <Ionicons 
                  name={member.has_gh === 1 ? "checkmark-circle" : "close-circle"} 
                  size={12} 
                  color={member.has_gh === 1 ? theme.colors.success : theme.colors.danger}
                />
              </View>
            </View>
          ))}
          {ghStats.totalMembers > 3 && (
            <ThemedText style={styles.moreMembers}>
              +{ghStats.totalMembers - 3} more member{ghStats.totalMembers - 3 !== 1 ? 's' : ''}
            </ThemedText>
          )}
        </View>
      )}
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.family.family_id === nextProps.family.family_id &&
    JSON.stringify(prevProps.family.family_members) === JSON.stringify(nextProps.family.family_members)
  );
});

FamilyCard.displayName = 'FamilyCard';

export default function HouseholdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();


  const [household, setHousehold] = useState<HouseholdDetail | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingVisit, setMarkingVisit] = useState(false);
  const [lastLoadedId, setLastLoadedId] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false); 

  
  useEffect(() => {
    const currentId = id;
    
    console.log(`🔄 Household ID changed to: ${currentId}`);
    
   
    if (lastLoadedId && lastLoadedId !== currentId) {
      console.log(` Switching from household ${lastLoadedId} to ${currentId}`);
      setTransitioning(true);
      setHousehold(null);
      setFamilies([]);
    }
    
    setLoading(true);
    setLastLoadedId(currentId);
    fetchHouseholdDetails();
  }, [id]);

  

  // Android back button handler
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  const handleBackPress = useCallback(() => {
    router.push('/(bhw)/menu/viewhousehold');
  }, [router]);

  const fetchHouseholdDetails = useCallback(async () => {
    try {
      const timestamp = new Date().getTime();
      console.log(`📡 Fetching household ${id} details...`);


      const [hhResponse, famResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/household_api/households/${id}/details/?t=${timestamp}`),
        fetch(`${API_BASE_URL}/household_api/households/${id}/families/?t=${timestamp}`)
      ]);

      const [hhData, famData] = await Promise.all([
        hhResponse.json(),
        famResponse.json()
      ]);

      if (hhData.success) {
        setHousehold(hhData.data);
        console.log(` Household ${id} data loaded`);
      } else {
        throw new Error(hhData.message || 'Failed to load household details');
      }

      if (famData.success) {
        //  Parse family_members if it's a string (JSONB from SQL)
        const parsedFamilies = (famData.data || []).map((family: any) => {
          let members = family.family_members;
          if (typeof members === 'string') {
            try {
              members = JSON.parse(members);
            } catch (e) {
              console.warn('Failed to parse family_members JSON:', e);
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
        console.log(` ${parsedFamilies.length} families loaded for household ${id}`);
      }

    } catch (error) {
      console.error(' Error fetching household details:', error);
      Alert.alert('Error', 'Failed to load household details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setTransitioning(false); // ✅ Clear transition state
    }
  }, [id]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHouseholdDetails();
  }, [fetchHouseholdDetails]);

  const handleAddFamily = useCallback(() => {
    router.push(`/(bhw)/household/${id}/add-family` as any);
  }, [router, id]);

  const handleFamilyPress = useCallback((familyId: number) => {
    router.push(`/(bhw)/family/${familyId}` as any);
  }, [router]);

  const handleMarkHouseholdVisited = useCallback(async () => {
    try {
      const session = await getUserSession();
      if (!session) {
        Alert.alert('Error', 'User session not found');
        return;
      }

      Alert.alert(
        'Confirm Visit',
        'Mark this household as visited?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark Visited',
            onPress: async () => {
              setMarkingVisit(true);
              
              try {
                const response = await fetch(
                  `${API_BASE_URL}/household_api/households/${id}/mark-visited/`,
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
                  Alert.alert('Success', 'Household marked as visited!');
                  fetchHouseholdDetails();
                } else {
                  Alert.alert('Error', data.message || 'Failed to mark as visited');
                }
              } catch (error) {
                console.error(' Error:', error);
                Alert.alert('Error', 'Network error. Please try again.');
              } finally {
                setMarkingVisit(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error(' Error:', error);
    }
  }, [id, fetchHouseholdDetails]);

  
  if (transitioning) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Household Details" onBackPress={handleBackPress} />
        <View style={styles.transitionContainer}>
          <View style={styles.transitionSpinner}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
          <ThemedText style={styles.transitionText}>Loading household...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  
  if (loading || !household) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Household Details" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
          <ThemedText style={styles.loadingText}>
            {lastLoadedId ? 'Loading household details...' : 'Loading...'}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Household Details"
        onBackPress={handleBackPress}
      />
      
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
        {/* 1. HOUSEHOLD OVERVIEW */}
        <View style={styles.overviewCard}>
          {/* Header with status badge */}
          <View style={styles.overviewHeader}>
            <View style={styles.titleSection}>
              <View style={styles.titleIcon}>
                <Ionicons name="home" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.householdNumber}>
                  {household.household_number}
                </ThemedText>
                <ThemedText style={styles.householdSubtitle}>
                  {household.families_count} familie{household.families_count !== 1 ? 's' : ''} • {household.members_count} member{household.members_count !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.statusBadges}>
              {!household.is_active && (
                <View style={[styles.statusBadge, styles.inactiveBadge]}>
                  <Ionicons name="close-circle" size={14} color="#FFFFFF" />
                  <ThemedText style={styles.badgeText}>Inactive</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Quick Stats - Vertical List Style */}
          <View style={styles.quickStatsList}>
            <View style={styles.quickStatRow}>
              <View style={styles.statRowLeft}>
                <View style={[styles.statIconSmall, { backgroundColor: theme.colors.infoLight }]}>
                  <Ionicons name="business-outline" size={12} color={theme.colors.info} />
                </View>
                <ThemedText style={styles.statRowLabel}>House Type</ThemedText>
              </View>
              <ThemedText style={styles.statRowValue} numberOfLines={2} ellipsizeMode="tail">
                {household.house_type || 'Not specified'}
              </ThemedText>
            </View>

            <View style={styles.quickStatRow}>
              <View style={styles.statRowLeft}>
                <View style={[styles.statIconSmall, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name="people-outline" size={12} color={theme.colors.primary} />
                </View>
                <ThemedText style={styles.statRowLabel}>Families</ThemedText>
              </View>
              <ThemedText style={styles.statRowValue}>{household.families_count}</ThemedText>
            </View>

            <View style={styles.quickStatRow}>
              <View style={styles.statRowLeft}>
                <View style={[
                  styles.statIconSmall, 
                  { backgroundColor: household.is_visited ? theme.colors.successLight : theme.colors.warningLight }
                ]}>
                  <Ionicons
                    name={household.is_visited ? "checkmark-circle-outline" : "time-outline"}
                    size={12}
                    color={household.is_visited ? theme.colors.success : theme.colors.warning}
                  />
                </View>
                <ThemedText style={styles.statRowLabel}>Visit Status</ThemedText>
              </View>
              <ThemedText style={[
                styles.statRowValue,
                { color: household.is_visited ? theme.colors.success : theme.colors.warning }
              ]}>
                {household.is_visited ? 'Completed' : 'Pending'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 2. VISIT MANAGEMENT */}
        {!household.is_visited && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.colors.successLight }]}>
                <Ionicons name="checkmark-done" size={20} color={theme.colors.success} />
              </View>
              <ThemedText style={[styles.sectionTitle, { color: theme.colors.success }]}>
                Mark as Visited
              </ThemedText>
            </View>

            <Pressable
              style={[styles.markVisitButton, markingVisit && styles.markVisitButtonDisabled]}
              onPress={handleMarkHouseholdVisited}
              disabled={markingVisit}
              android_ripple={{ color: '#065F46' }}
            >
              {markingVisit ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.markVisitButtonText}>
                    Mark Household as Visited
                  </ThemedText>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* 3. HOUSEHOLD DETAILS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.colors.infoLight }]}>
              <Ionicons name="information-circle" size={20} color={theme.colors.info} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.info }]}>
              Household Details
            </ThemedText>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailGroup}>
              <ThemedText style={styles.detailGroupTitle}>Basic Information</ThemedText>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Household Head</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {household.household_head || 'Not assigned'}
                </ThemedText>
              </View>

              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Respondent</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {household.respondent || 'Not assigned'}
                </ThemedText>
              </View>

              <View style={[styles.detailItem, { marginBottom: 0 }]}>
                <ThemedText style={styles.detailLabel}>Address</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {household.full_address || 'Not specified'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailGroup}>
              <ThemedText style={styles.detailGroupTitle}>Property Information</ThemedText>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>House Ownership</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {household.house_ownership || 'Not specified'}
                </ThemedText>
              </View>

              <View style={[styles.detailItem, { marginBottom: 0 }]}>
                <ThemedText style={styles.detailLabel}>House Type</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {household.house_type || 'Not specified'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* 4. FAMILIES SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="people" size={20} color={theme.colors.primary} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Families ({families.length})
            </ThemedText>
            
            <Pressable 
              style={styles.addButton}
              onPress={handleAddFamily}
              hitSlop={8}
            >
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            </Pressable>
          </View>

          {families.length > 0 ? (
            <View style={styles.familiesList}>
              {families.map((family, index) => (
                <View key={family.family_id} style={index !== families.length - 1 ? styles.familyDivider : {}}>
                  <FamilyCard 
                    family={family} 
                    onPress={handleFamilyPress}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyFamilies}>
              <View style={styles.emptyFamiliesIcon}>
                <Ionicons name="people-outline" size={32} color={theme.colors.textLight} />
              </View>
              <ThemedText style={styles.emptyFamiliesTitle}>No families yet</ThemedText>
              <ThemedText style={styles.emptyFamiliesSubtitle}>
                Add the first family to this household
              </ThemedText>
              <Pressable
                style={styles.addFamilyButton}
                onPress={handleAddFamily}
                android_ripple={{ color: '#1E40AF' }}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <ThemedText style={styles.addFamilyText}>Add Family</ThemedText>
              </Pressable>
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

  // ✅ SOLUTION 2: Transition loading states
  transitionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xxxl,
  },
  transitionSpinner: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.md,
  },
  transitionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
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
  householdNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  householdSubtitle: {
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
  inactiveBadge: {
    backgroundColor: theme.colors.inactive,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 80,
  },

  // ✅ Quick stats - vertical list style
  quickStatsList: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
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
  statIconSmall: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
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

  // Visit button
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

  // Families list
  familiesList: {
    gap: 2,
  },
  familyCard: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  familyDivider: {
    marginBottom: 2,
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  familyInfo: {
    flex: 1,
  },
  familyCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  familyCode: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  householdTypeBadge: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  householdTypeText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  headInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  familyHead: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },

  // Family badges
  familyBadges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  nhtsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.nhts,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    gap: 4,
  },
  ipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.ip,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    gap: 4,
  },

  // Members summary
  membersSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  membersCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  membersCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.info,
  },
  ghInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ghText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Members preview
  membersPreview: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  memberAvatar: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  ghBadge: {
    padding: 2,
  },
  moreMembers: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },

  // Empty families
  emptyFamilies: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyFamiliesIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyFamiliesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  emptyFamiliesSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  addFamilyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  addFamilyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
});