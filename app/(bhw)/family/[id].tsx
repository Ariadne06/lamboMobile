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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

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
  ip_status: boolean;
  ip_tribe?: string;
  nhts_status: boolean;
  water_source_name: string;
  toilet_facility_name: string;
  waste_management_name: string;
  is_visited: boolean;
  date_visited?: string;
  visited_by_full_name?: string;
  is_active: boolean;
  members_json: FamilyMember[] | null;
}

export default function FamilyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [family, setFamily] = useState<FamilyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Centralized back press handler
  const handleBackPress = () => {
    if (family?.household_id) {
      router.push(`/(bhw)/household/${family.household_id}` as any);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(bhw)/menu/viewhousehold');
    }
  };

  // Android back button
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

  // Fetch on mount/id change
  useEffect(() => {
    fetchFamilyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchFamilyDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/household_api/families/${id}/details/`);
      const data = await response.json();

      if (data?.success) {
        const familyData: FamilyDetail = {
          ...data.data,
          members_json: Array.isArray(data.data?.members_json) ? data.data.members_json : null,
        };
        setFamily(familyData);
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

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Family Details" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
          <ThemedText style={styles.loadingText}>Loading family details…</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Not found
  if (!family) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Family Details" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <ThemedText style={styles.emptyText}>Family not found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            This family may have been removed or the ID is invalid.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Derived members
  const members = family.members_json || [];
  const totalMembers = members.length;
  const membersWithGH = members.filter((m) => m?.has_gh === 1).length;
  const ghPct = totalMembers ? Math.round((membersWithGH / totalMembers) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={family.family_code} onBackPress={handleBackPress} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF3D33']}
            tintColor="#FF3D33"
          />
        }
      >
        {/* Overview: badges + quick stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconPillRed}>
              <Ionicons name="information-circle" size={18} color="#FF3D33" />
            </View>
            <ThemedText style={styles.cardTitle}>Overview</ThemedText>
          </View>

          {/* Badges */}
          <View style={styles.badgeRow}>
            {family.nhts_status && (
              <View style={[styles.badgePill, { backgroundColor: '#3B82F6' }]}>
                <MaterialCommunityIcons name="target-account" size={14} color="#fff" />
                <ThemedText style={styles.badgeText}>NHTS</ThemedText>
              </View>
            )}
            {family.ip_status && (
              <View style={[styles.badgePill, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="people" size={14} color="#fff" />
                <ThemedText style={styles.badgeText}>
                  IP{family.ip_tribe ? ` • ${family.ip_tribe}` : ''}
                </ThemedText>
              </View>
            )}
            {!family.is_active && (
              <View style={[styles.badgePill, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="close-circle" size={14} color="#fff" />
                <ThemedText style={styles.badgeText}>Inactive</ThemedText>
              </View>
            )}
          </View>

          {/* Quick stats */}
          <View style={styles.statRow}>
            <View style={[styles.statCard, styles.statCardFirst]}>
              <ThemedText style={styles.statValue}>{totalMembers}</ThemedText>
              <ThemedText style={styles.statLabel}>Members</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statValue}>{membersWithGH}</ThemedText>
              <ThemedText style={styles.statLabel}>With GH</ThemedText>
            </View>
            <View style={[styles.statCard, styles.statCardLast]}>
              <ThemedText style={styles.statValue}>{ghPct}%</ThemedText>
              <ThemedText style={styles.statLabel}>GH Coverage</ThemedText>
            </View>
          </View>

          {/* Inline visit status */}
          <View style={styles.inlineRow}>
            <ThemedText style={styles.inlineLabel}>Visit Status</ThemedText>
            <View
              style={[
                styles.visitBadge,
                family.is_visited ? styles.visitedBadge : styles.notVisitedBadge,
              ]}
            >
              <Ionicons
                name={family.is_visited ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color="#fff"
              />
              <ThemedText style={styles.visitBadgeText}>
                {family.is_visited ? 'Visited' : 'Not Visited'}
              </ThemedText>
            </View>
          </View>

          {/* GH mini bar */}
          {totalMembers > 0 && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${ghPct}%` }]} />
              </View>
              <ThemedText style={styles.progressCaption}>
                {membersWithGH}/{totalMembers} have General Health records
              </ThemedText>
            </View>
          )}
        </View>

        {/* Family Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconPillRed}>
              <Ionicons name="people" size={18} color="#FF3D33" />
            </View>
            <ThemedText style={styles.cardTitle}>Family Information</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Family Head</ThemedText>
            <ThemedText style={styles.value}>{family.fam_head_full_name || 'N/A'}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Respondent</ThemedText>
            <ThemedText style={styles.value}>{family.respondent_full_name || 'N/A'}</ThemedText>
          </View>

          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <ThemedText style={styles.label}>Relationship to Family Head</ThemedText>
            <ThemedText style={styles.value}>{family.respondent_rtf_name || 'N/A'}</ThemedText>
          </View>
        </View>

        {/* Facilities & Sanitation */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconPillCyan}>
              <Ionicons name="home" size={18} color="#0ea5e9" />
            </View>
            <ThemedText style={[styles.cardTitle, { color: '#0ea5e9' }]}>
              Facilities &amp; Sanitation
            </ThemedText>
          </View>

          <View style={styles.facilityItem}>
            <Ionicons name="water" size={18} color="#0ea5e9" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.facilityLabel}>Water Source</ThemedText>
              <ThemedText style={styles.facilityValue}>
                {family.water_source_name || 'Not specified'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.facilityItem}>
            <MaterialCommunityIcons name="toilet" size={18} color="#0ea5e9" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.facilityLabel}>Toilet Facility</ThemedText>
              <ThemedText style={styles.facilityValue}>
                {family.toilet_facility_name || 'Not specified'}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.facilityItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Ionicons name="trash" size={18} color="#0ea5e9" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.facilityLabel}>Waste Management</ThemedText>
              <ThemedText style={styles.facilityValue}>
                {family.waste_management_name || 'Not specified'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Members */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconPillGreen}>
              <Ionicons name="people-outline" size={18} color="#10B981" />
            </View>
            <ThemedText style={[styles.cardTitle, { color: '#10B981' }]}>
              Family Members ({totalMembers})
            </ThemedText>

            <Pressable
              style={styles.addMemberButton}
              onPress={() => router.push(`/(bhw)/family/${id}/add-member` as any)}
              hitSlop={6}
            >
              <Ionicons name="person-add" size={18} color="#059669" />
            </Pressable>
          </View>

          {/* Members list */}
          {members.length > 0 ? (
            members.map((member, index) => (
              <Pressable
                key={member?.family_member_id ?? index}
                style={[
                  styles.memberRow,
                  index !== members.length - 1 && styles.memberDivider,
                ]}
                onPress={() =>
                  router.push(`/(bhw)/family/${id}/member/${member.family_member_id}/` as any)
                }
              >
                <View style={styles.memberLeft}>
                  <Ionicons name="person" size={18} color="#6B7280" />
                  <ThemedText style={styles.memberName} numberOfLines={1}>
                    {member?.full_name || 'Unnamed member'}
                  </ThemedText>
                </View>

                {member?.has_gh === 1 ? (
                  <View style={styles.ghBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <ThemedText style={styles.ghBadgeText}>GH</ThemedText>
                  </View>
                ) : null}
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyMembersContainer}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <ThemedText style={styles.emptyMembers}>No members registered</ThemedText>
              <ThemedText style={styles.emptyMembersSubtext}>
                Add family members to complete the profile
              </ThemedText>
            </View>
          )}
        </View>

        {/* Detailed Visit Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconPillAmber}>
              <Ionicons name="calendar" size={18} color="#F59E0B" />
            </View>
            <ThemedText style={[styles.cardTitle, { color: '#F59E0B' }]}>
              Visit Details
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Status</ThemedText>
            <View
              style={[
                styles.visitBadge,
                family.is_visited ? styles.visitedBadge : styles.notVisitedBadge,
              ]}
            >
              <Ionicons
                name={family.is_visited ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color="#FFFFFF"
              />
              <ThemedText style={styles.visitBadgeText}>
                {family.is_visited ? 'Visited' : 'Not Visited'}
              </ThemedText>
            </View>
          </View>

          {family.is_visited && (
            <>
              {family.date_visited && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Date Visited</ThemedText>
                  <ThemedText style={styles.value}>
                    {new Date(family.date_visited).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </ThemedText>
                </View>
              )}
              {family.visited_by_full_name && (
                <View style={[styles.infoRow, { marginBottom: 0 }]}>
                  <ThemedText style={styles.label}>Visited By</ThemedText>
                  <ThemedText style={styles.value}>{family.visited_by_full_name}</ThemedText>
                </View>
              )}
            </>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: '#F6F7FB' },
  scrollView: { flex: 1, padding: 16 },

  // Loading / Empty
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 6 },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#FF3D33' },

  // Icon pills
  iconPillRed: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,61,51,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconPillCyan: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(14,165,233,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconPillGreen: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconPillAmber: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Overview
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  badgePill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, marginRight: 8, marginBottom: 8,
    gap: 6,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  statRow: { flexDirection: 'row', marginBottom: 8 },
  statCard: {
    flex: 1, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  statCardFirst: {},
  statCardLast: { marginRight: 0 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  inlineRow: {
    marginTop: 6, marginBottom: 6,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inlineLabel: { fontSize: 12, color: '#6B7280' },

  // Progress
  progressWrap: { marginTop: 8 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981' },
  progressCaption: { marginTop: 6, fontSize: 12, color: '#065F46', fontWeight: '700' },

  // Info rows
  infoRow: { marginBottom: 12 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  value: { fontSize: 15, color: '#111827', fontWeight: '600' },

  // Facilities
  facilityItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  facilityLabel: { fontSize: 12, color: '#6B7280' },
  facilityValue: { fontSize: 14, color: '#111827', fontWeight: '700', marginTop: 2 },

  // Members
  addMemberButton: {
    marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1, borderColor: '#A7F3D0',
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  memberRow: {
    paddingVertical: 12, paddingHorizontal: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  memberDivider: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  memberName: { fontSize: 14, color: '#111827', flex: 1 },

  ghBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ghBadgeText: { fontSize: 11, color: '#10B981', fontWeight: '800' },

  emptyMembersContainer: { alignItems: 'center', paddingVertical: 24 },
  emptyMembers: { textAlign: 'center', color: '#374151', fontSize: 14, fontWeight: '700', marginTop: 8 },
  emptyMembersSubtext: { textAlign: 'center', color: '#9CA3AF', fontSize: 12 },

  // Visit badge
  visitBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, gap: 6,
  },
  visitedBadge: { backgroundColor: '#10B981' },
  notVisitedBadge: { backgroundColor: '#F59E0B' },
  visitBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});