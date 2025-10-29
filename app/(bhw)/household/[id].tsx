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
import { API_BASE_URL, API_ENDPOINTS  } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native';
import { getUserSession } from '@/utils/session';
import { Picker } from '@react-native-picker/picker';

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
  visited_by_full_name?: string;
  is_active: boolean;
  families_count: number;
  members_count: number;
  is_current_quarter?: boolean;
  quarter_id?: number;
  quarter_name?: string;
  year?: number;
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

interface Quarter {
  quarter_id: number;
  quarter_name: string;
  year: number;
  start_date: string;
  end_date: string;
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

// Helper function to filter out sentinel/placeholder families
const filterActualFamilies = (rawFamilies: any[]) => {
  if (!Array.isArray(rawFamilies)) return [];
  
  return rawFamilies.filter((family: any) => {
    // Filter out families with invalid/sentinel IDs
    if (!family.family_id || family.family_id === 0 || family.family_id < 1) {
      console.log('Filtered out sentinel family (invalid ID):', family);
      return false;
    }
    
    // Filter out families with placeholder family codes
    if (family.family_code && (
      family.family_code.includes('PLACEHOLDER') ||
      family.family_code.includes('TEMP') ||
      family.family_code.includes('SENTINEL') ||
      family.family_code.includes('DEFAULT') ||
      family.family_code === '' ||
      family.family_code === null ||
      family.family_code === 'N/A'
    )) {
      console.log('Filtered out placeholder family (invalid code):', family);
      return false;
    }
    
    // Filter out families with no family head assigned (likely sentinel records)
    if (!family.family_head || 
        family.family_head === 'Not assigned' || 
        family.family_head === '' ||
        family.family_head === null ||
        family.family_head === 'N/A' ||
        family.family_head === 'TBD' ||
        family.family_head === 'PENDING') {
      console.log('Filtered out family with no head:', family);
      return false;
    }
    
    // If all checks pass, this is likely a real family
    return true;
  });
};

// Memoized Family Card Component for Performance
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

  // State
  const [household, setHousehold] = useState<HouseholdDetail | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [selectedQuarterId, setSelectedQuarterId] = useState<number | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingVisit, setMarkingVisit] = useState(false);
  const [lastLoadedId, setLastLoadedId] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [hasDataForQuarter, setHasDataForQuarter] = useState(true);

  // Load quarters and auto-select latest
  const loadQuarters = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.QUARTERS}`);
      const quartersData = await response.json();
      
      if (quartersData && Array.isArray(quartersData) && quartersData.length > 0) {
        setQuarters(quartersData);
        
        // Always auto-select the latest quarter (first in array since it's ordered by latest)
        const latestQuarter = quartersData[0];
        setSelectedQuarterId(latestQuarter.quarter_id);
        console.log(`Auto-selected latest quarter: ${latestQuarter.quarter_name} (ID: ${latestQuarter.quarter_id})`);
      } else {
        // If no quarters available, set to a default value to prevent null
        console.log('No quarters available, using default');
        setSelectedQuarterId(1); // Use 1 as default
      }
    } catch (error) {
      console.error('Failed to load quarters:', error);
      // On error, set to default instead of null
      setSelectedQuarterId(1);
    }
  }, []); // Remove selectedQuarterId dependency to prevent loops

  // Initialize and handle ID changes
  useEffect(() => {
    const currentId = id;
    
    console.log(`Household ID changed to: ${currentId}`);
    
    if (lastLoadedId && lastLoadedId !== currentId) {
      console.log(`Switching from household ${lastLoadedId} to ${currentId}`);
      setTransitioning(true);
      setHousehold(null);
      setFamilies([]);
      setSelectedQuarterId(null); // Reset quarter selection
    }
    
    setLoading(true);
    setLastLoadedId(currentId);
    
    // If no quarter selected yet, load quarters (which will auto-select latest)
    if (selectedQuarterId === null) {
      loadQuarters();
    }
  }, [id, lastLoadedId, selectedQuarterId, loadQuarters]);

  // Fetch data when quarter changes
  useEffect(() => {
    // Only fetch if we have a valid quarter ID (not null)
    if (selectedQuarterId !== null && selectedQuarterId !== undefined) {
      console.log(`Triggering fetch for quarter: ${selectedQuarterId}`);
      fetchHouseholdDetails();
    } else {
      console.log(`Waiting for quarter selection...`);
    }
  }, [selectedQuarterId]);

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

  // WORKAROUND: Fetch household details with sentinel record filtering
  const fetchHouseholdDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      const timestamp = new Date().getTime();
      console.log(`Fetching household ${id} details for quarter ${selectedQuarterId}...`);

      const quarterParam = selectedQuarterId ? `&quarter_id=${selectedQuarterId}` : '';

      const [hhResponse, famResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/household_api/households/${id}/details/?t=${timestamp}${quarterParam}`),
        fetch(`${API_BASE_URL}/household_api/households/${id}/families/?t=${timestamp}${quarterParam}`)
      ]);

      const [hhData, famData] = await Promise.all([
        hhResponse.json(),
        famResponse.json()
      ]);

      // Handle household data
      if (hhData.success) {
        if (hhData.data && hhData.has_data_for_quarter !== false) {
          setHousehold(hhData.data);
          setHasDataForQuarter(true);
          console.log(`Household ${id} data loaded for quarter ${selectedQuarterId}`);
        } else {
          setHousehold(null);
          setHasDataForQuarter(false);
          console.log(`No household data for quarter ${selectedQuarterId}`);
        }
      } else {
        throw new Error(hhData.message || 'Failed to load household details');
      }

      // WORKAROUND: Handle families data with sentinel record filtering
      if (famData.success) {
        const rawFamilies = famData.data || [];
        console.log(`Raw families received: ${rawFamilies.length}`);
        
        // Filter out sentinel/placeholder families
        const actualFamilies = filterActualFamilies(rawFamilies);
        console.log(`Actual families after filtering: ${actualFamilies.length}`);

        const parsedFamilies = actualFamilies.map((family: any) => {
          let members = family.family_members;
          if (typeof members === 'string') {
            try {
              members = JSON.parse(members);
            } catch (e) {
              console.warn('Failed to parse family_members JSON:', e);
              members = [];
            }
          }
          
          if (!Array.isArray(members)) {
            members = [];
          }

          return {
            ...family,
            family_members: members
          };
        });

        setFamilies(parsedFamilies);
        console.log(`${parsedFamilies.length} ACTUAL families loaded for household ${id} (quarter ${selectedQuarterId})`);
      } else {
        setFamilies([]);
        console.log(`No families found for household ${id} (quarter ${selectedQuarterId})`);
      }

    } catch (error) {
      console.error('Error fetching household details:', error);
      Alert.alert('Error', 'Failed to load household details. Please try again.');
      setHasDataForQuarter(false);
      setFamilies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setTransitioning(false);
    }
  }, [id, selectedQuarterId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHouseholdDetails();
  }, [fetchHouseholdDetails]);

  // Clear cached data when quarter changes
  const handleQuarterChange = useCallback((quarterId: number | null) => {
    // Prevent null selection
    if (quarterId === null || quarterId === undefined) {
      console.log('Attempted to select null quarter, ignoring');
      return;
    }
    
    if (quarterId !== selectedQuarterId) {
      console.log(`Quarter changed from ${selectedQuarterId} to ${quarterId}`);
      setLoading(true);
      
      // Clear all cached data for the new quarter
      setHousehold(null);
      setFamilies([]);
      setHasDataForQuarter(true); // Reset to true, will be updated by API response
      
      setSelectedQuarterId(quarterId);
    }
  }, [selectedQuarterId]);

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
  }, [id, fetchHouseholdDetails]);

  // Loading state during transition
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

  // Initial loading state
  if (loading && (selectedQuarterId === null || selectedQuarterId === undefined)) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Household Details" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
          <ThemedText style={styles.loadingText}>
            Loading quarters and household details...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // No data for selected quarter
  if (!loading && !household && !hasDataForQuarter && selectedQuarterId) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Household Details" onBackPress={handleBackPress} />
        
        {/* Quarter Filter */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
            <ThemedText style={styles.filterLabel}>Quarter:</ThemedText>
          </View>
          
          <View style={styles.quarterPickerContainer}>
            <Picker
              selectedValue={selectedQuarterId}
              onValueChange={handleQuarterChange}
              style={styles.quarterPicker}
            >
              {/* REMOVED: Select Quarter option */}
              {quarters.map((quarter) => (
                <Picker.Item 
                  key={quarter.quarter_id} 
                  label={quarter.quarter_name}
                  value={quarter.quarter_id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* No Data Message */}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
          </View>
          <ThemedText style={styles.emptyTitle}>No Data for Selected Quarter</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            This household doesn&apos;t have any records for the selected quarter. Try selecting a different quarter or check back later.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Household Details"
        onBackPress={handleBackPress}
      />
      
      {/* Quarter Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
          <ThemedText style={styles.filterLabel}>Quarter:</ThemedText>
        </View>
        
        <View style={styles.quarterPickerContainer}>
          <Picker
            selectedValue={selectedQuarterId}
            onValueChange={handleQuarterChange}
            style={styles.quarterPicker}
          >
            {/* REMOVED: Select Quarter option that returns null */}
            {quarters.map((quarter) => (
              <Picker.Item 
                key={quarter.quarter_id} 
                label={quarter.quarter_name}
                value={quarter.quarter_id} 
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Loading state for data refresh */}
      {loading && (
        <View style={styles.refreshLoadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <ThemedText style={styles.refreshLoadingText}>
            Loading data for selected quarter...
          </ThemedText>
        </View>
      )}

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
        {/* Household Overview */}
        {household && (
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
                    {/* ALWAYS use filtered families array length */}
                    {families.length} familie{families.length !== 1 ? 's' : ''} • {household.members_count} member{household.members_count !== 1 ? 's' : ''}
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
            {/* Quick Stats */}
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
                {/* ALWAYS use filtered families count */}
                <ThemedText style={styles.statRowValue}>{families.length}</ThemedText>
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
                <View style={styles.visitStatusContainer}>
                  <ThemedText style={[
                    styles.statRowValue,
                    { color: household.is_visited ? theme.colors.success : theme.colors.warning }
                  ]}>
                    {household.is_visited ? 'Visited' : 'Pending'}
                  </ThemedText>
                </View>
              </View>

              {/* Visit Details - Show when visited */}
              {household.is_visited && (household.date_visited || household.visited_by_full_name) && (
                <>
                  {household.date_visited && (
                    <View style={styles.quickStatRow}>
                      <View style={styles.statRowLeft}>
                        <View style={[styles.statIconSmall, { backgroundColor: theme.colors.infoLight }]}>
                          <Ionicons name="calendar-outline" size={12} color={theme.colors.info} />
                        </View>
                        <ThemedText style={styles.statRowLabel}>Date Visited</ThemedText>
                      </View>
                      <ThemedText style={styles.statRowValue}>
                        {new Date(household.date_visited).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric', 
                          year: 'numeric'
                        })}
                      </ThemedText>
                    </View>
                  )}
                  
                  {household.visited_by_full_name && (
                    <View style={styles.quickStatRow}>
                      <View style={styles.statRowLeft}>
                        <View style={[styles.statIconSmall, { backgroundColor: theme.colors.primaryLight }]}>
                          <Ionicons name="person-outline" size={12} color={theme.colors.primary} />
                        </View>
                        <ThemedText style={styles.statRowLabel}>Visited By</ThemedText>
                      </View>
                      <ThemedText style={styles.statRowValue}>
                        {household.visited_by_full_name}
                      </ThemedText>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Minimal Update Button - Only show for current quarter, non-visited households */}
            {/* {!household.is_visited && (household.is_current_quarter !== false) && (
              <Pressable
                style={styles.minimalUpdateButton}
                onPress={() => router.push(`/(bhw)/household/${id}/update-household` as any)}
              >
                <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.minimalUpdateText}>Edit</ThemedText>
              </Pressable>
            )} */}
          </View>
        )}

        {/* Household Details */}
        {household && (
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
        )}

        {/* Families Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="people" size={20} color={theme.colors.primary} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              {/* ALWAYS use filtered families count */}
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
                {selectedQuarterId ? 
                  'No families found for the selected quarter' : 
                  'Add the first family to this household'
                }
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

        {/* Combined Actions Card - Only for non-visited households */}
        {household && !household.is_visited && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="options-outline" size={20} color={theme.colors.primary} />
              </View>
              <ThemedText style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Household Actions
              </ThemedText>
            </View>

            <View style={styles.actionButtonsContainer}>
              {/* Update Household Button */}
              {(household.is_current_quarter !== false) && (
                <Pressable
                  style={styles.actionButton}
                  onPress={() => router.push(`/(bhw)/household/${id}/update-household` as any)}
                >
                  <View style={styles.actionButtonContent}>
                    <View style={styles.actionButtonIcon}>
                      <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.actionButtonTextContainer}>
                      <ThemedText style={styles.actionButtonTitle}>Update Household</ThemedText>
                      <ThemedText style={styles.actionButtonSubtitle}>
                        Edit household information
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                  </View>
                </Pressable>
              )}

              {/* Mark as Visited Button */}
              <Pressable
                style={[
                  styles.actionButton,
                  styles.markVisitActionButton,
                  markingVisit && styles.actionButtonDisabled
                ]}
                onPress={handleMarkHouseholdVisited}
                disabled={markingVisit}
              >
                <View style={styles.actionButtonContent}>
                  <View style={[styles.actionButtonIcon, styles.markVisitIcon]}>
                    {markingVisit ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.actionButtonTextContainer}>
                    <ThemedText style={[styles.actionButtonTitle, styles.markVisitTitle]}>
                      {markingVisit ? 'Marking as Visited...' : 'Mark as Visited'}
                    </ThemedText>
                    <ThemedText style={[styles.actionButtonSubtitle, styles.markVisitSubtitle]}>
                      Complete household visit
                    </ThemedText>
                  </View>
                  {!markingVisit && (
                    <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        )}

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

  // Transition loading states
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

  // Refresh loading
  refreshLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight,
    gap: theme.spacing.md,
  },
  refreshLoadingText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },

  // Quarter Filter
  filterSection: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  quarterPickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
  },
  quarterPicker: {
    color: theme.colors.textPrimary,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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

  // Quick stats
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
  visitStatusContainer: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: theme.spacing.lg,
  },

  // Minimal Update Button
  minimalUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', // Only takes needed space
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  minimalUpdateText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
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

  // Action Buttons Container
  actionButtonsContainer: {
    gap: theme.spacing.md,
  },
  actionButton: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  markVisitActionButton: {
    backgroundColor: theme.colors.success,
  },
  actionButtonDisabled: {
    backgroundColor: theme.colors.textLight,
    opacity: 0.6,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markVisitIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonTextContainer: {
    flex: 1,
    gap: 2,
  },
  actionButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  markVisitTitle: {
    color: '#FFFFFF',
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  markVisitSubtitle: {
    color: 'rgba(255,255,255,0.8)',
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