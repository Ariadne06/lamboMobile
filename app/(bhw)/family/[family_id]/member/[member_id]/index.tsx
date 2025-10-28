import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Pressable,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
    female: '#EC4899',
    femaleLight: '#FDF2F8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  }
};

interface FamilyMemberDetail {
  family_member_id: number;
  family_member_code: string;
  rth_id: number;
  rth_name: string;
  rtf_id: number;
  rtf_name: string;
  resident_id: number;
  resident_full_name: string;
  sex: string; 
  philhealthid_number: string | null;
  membership_type: 'M' | 'D' | null;
  philhealth_category_id: number | null;
  philhealth_category_name: string | null;
  nutrition_status_id: number | null;
  nutrition_status_name: string | null;
  date_added: string;
  added_by_id: number;
  added_by_full_name: string;
  has_general_health: boolean;
  gh_id: number | null;
  gh_class_id: number | null;
  gh_class_description: string | null;
  gh_medical_history_ids: number[] | null;
  gh_medical_history_names: string[] | null;
  gh_age: number | null;
  gh_smoker: boolean | null;
  gh_alcohol_drinker: boolean | null;
  gh_sexually_active: boolean | null;
  gh_last_menstrual_period: string | null;
  gh_fp_method_yn: boolean | null;
  gh_fp_method_id: number | null;
  gh_fp_method_name: string | null;
  gh_fp_status_id: number | null;
  gh_fp_status_name: string | null;
  gh_age_of_menarche: number | null; 
}

export default function FamilyMemberDetailScreen() {
  const { family_id, member_id } = useLocalSearchParams<{ 
    family_id: string; 
    member_id: string;
  }>();
  const router = useRouter();
  
  const [member, setMember] = useState<FamilyMemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMemberDetails();
  }, [member_id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchMemberDetails();
      return () => {};
    }, [member_id])
  );

  const handleBackPress = () => {
    router.push(`/(bhw)/family/${family_id}` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [family_id])
  );
  
  const fetchMemberDetails = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/household_api/family-members/${member_id}/`
      );
      const data = await response.json();

      if (data.success) {
        setMember(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to load member details');
      }
    } catch (error) {
      console.error('Error fetching member:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMemberDetails();
  };

  const getMembershipTypeText = (type: 'M' | 'D' | null): string => {
    if (!type) return 'Not specified';
    return type === 'M' ? 'Member' : 'Dependent';
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const renderLifestyleIndicator = (value: boolean | null, riskType: 'high' | 'moderate' | 'neutral') => {
    if (value === null) {
      return (
        <View style={styles.lifestyleAnswer}>
          <View style={[styles.lifestyleIndicator, styles.unknownIndicator]}>
            <Ionicons name="help-outline" size={12} color={theme.colors.textMuted} />
          </View>
          <ThemedText style={[styles.lifestyleValue, styles.unknownValue]}>
            Unknown
          </ThemedText>
        </View>
      );
    }

    if (value) {
      const indicatorStyle = riskType === 'high' 
        ? styles.riskIndicator 
        : riskType === 'moderate' 
        ? styles.cautionIndicator 
        : styles.neutralIndicator;
      
      const textStyle = riskType === 'high' 
        ? styles.riskValue 
        : riskType === 'moderate' 
        ? styles.cautionValue 
        : styles.neutralValue;

      return (
        <View style={styles.lifestyleAnswer}>
          <View style={[styles.lifestyleIndicator, indicatorStyle]}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.lifestyleValue, textStyle]}>
            Yes
          </ThemedText>
        </View>
      );
    } else {
      return (
        <View style={styles.lifestyleAnswer}>
          <View style={[styles.lifestyleIndicator, styles.safeIndicator]}>
            <Ionicons name="close" size={12} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.lifestyleValue, styles.safeValue]}>
            No
          </ThemedText>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Member Details" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading member details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!member || member.family_member_id === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Member Details" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Member not found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            {member?.family_member_id === 0 
              ? 'No snapshot exists for this quarter' 
              : 'This family member may have been removed'}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const isFemale = member.sex?.toLowerCase() === 'female';

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Family Member Details" onBackPress={handleBackPress} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Member Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[
              styles.avatar, 
              { backgroundColor: isFemale ? theme.colors.femaleLight : theme.colors.primaryLight }
            ]}>
              <ThemedText style={[
                styles.avatarText,
                { color: isFemale ? theme.colors.female : theme.colors.primary }
              ]}>
                {member.resident_full_name?.charAt(0) || '?'}
              </ThemedText>
            </View>
            
            <View style={styles.profileInfo}>
              <ThemedText style={styles.memberName}>
                {member.resident_full_name}
              </ThemedText>
              <ThemedText style={styles.memberCode}>
                {member.family_member_code}
              </ThemedText>
              <View style={[
                styles.genderBadge,
                { backgroundColor: isFemale ? theme.colors.femaleLight : theme.colors.primaryLight }
              ]}>
                <ThemedText style={[
                  styles.genderText,
                  { color: isFemale ? theme.colors.female : theme.colors.primary }
                ]}>
                  {member.sex || 'Unknown'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Basic Information</ThemedText>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Resident ID</ThemedText>
            <ThemedText style={styles.infoValue}>#{member.resident_id}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Household Relationship</ThemedText>
            <ThemedText style={styles.infoValue}>{member.rth_name || 'Not specified'}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Family Relationship</ThemedText>
            <ThemedText style={styles.infoValue}>{member.rtf_name || 'Not specified'}</ThemedText>
          </View>
        </View>

        {/* PhilHealth Coverage */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>PhilHealth Coverage</ThemedText>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.success} />
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>ID Number</ThemedText>
            <ThemedText style={[styles.infoValue, !member.philhealthid_number && styles.notProvided]}>
              {member.philhealthid_number || 'Not provided'}
            </ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Membership Type</ThemedText>
            <View style={[
              styles.statusBadge,
              member.membership_type === 'M' ? styles.principalBadge : styles.dependentBadge
            ]}>
              <ThemedText style={styles.statusText}>
                {getMembershipTypeText(member.membership_type)}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Category</ThemedText>
            <ThemedText style={styles.infoValue}>
              {member.philhealth_category_name || 'Not specified'}
            </ThemedText>
          </View>
        </View>

        {/* Nutrition Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Nutrition Status</ThemedText>
            <Ionicons name="fitness-outline" size={18} color={theme.colors.warning} />
          </View>
          
          <View style={styles.nutritionCard}>
            <ThemedText style={[
              styles.nutritionStatus,
              !member.nutrition_status_name && styles.notProvided
            ]}>
              {member.nutrition_status_name || 'Assessment pending'}
            </ThemedText>
          </View>
        </View>

        {/* Health Profile */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Health Profile</ThemedText>
            <Ionicons name="medical-outline" size={18} color={theme.colors.primary} />
          </View>

          {member.has_general_health ? (
            <View style={styles.healthContent}>
              {/* Population Group */}
              {member.gh_class_description && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Population Group</ThemedText>
                  <ThemedText style={styles.infoValue}>{member.gh_class_description}</ThemedText>
                </View>
              )}

              {/* Age */}
              {member.gh_age && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Age at Record</ThemedText>
                  <ThemedText style={styles.infoValue}>{member.gh_age} years</ThemedText>
                </View>
              )}

              {/* Lifestyle Factors */}
              <View style={styles.lifestyleSection}>
                <View style={styles.lifestyleTitleRow}>
                  <Ionicons name="heart-outline" size={16} color={theme.colors.primary} />
                  <ThemedText style={styles.sectionTitle}>Lifestyle Assessment</ThemedText>
                </View>
                <View style={styles.lifestyleGrid}>
                  <View style={styles.lifestyleItem}>
                    <View style={styles.lifestyleLabelRow}>
                      <Ionicons name="ban-outline" size={14} color={theme.colors.textSecondary} />
                      <ThemedText style={styles.lifestyleLabel}>Smoking</ThemedText>
                    </View>
                    {renderLifestyleIndicator(member.gh_smoker, 'high')}
                  </View>

                  <View style={styles.lifestyleItem}>
                    <View style={styles.lifestyleLabelRow}>
                      <Ionicons name="wine-outline" size={14} color={theme.colors.textSecondary} />
                      <ThemedText style={styles.lifestyleLabel}>Alcohol Consumption</ThemedText>
                    </View>
                    {renderLifestyleIndicator(member.gh_alcohol_drinker, 'moderate')}
                  </View>

                  <View style={styles.lifestyleItem}>
                    <View style={styles.lifestyleLabelRow}>
                      <Ionicons name="heart-half-outline" size={14} color={theme.colors.textSecondary} />
                      <ThemedText style={styles.lifestyleLabel}>Sexually Active</ThemedText>
                    </View>
                    {renderLifestyleIndicator(member.gh_sexually_active, 'neutral')}
                  </View>
                </View>
              </View>

              {/* Medical History */}
              {member.gh_medical_history_names && 
              Array.isArray(member.gh_medical_history_names) && 
              member.gh_medical_history_names.length > 0 && (
                <View style={styles.medicalSection}>
                  <View style={styles.medicalTitleRow}>
                    <Ionicons name="clipboard-outline" size={16} color={theme.colors.danger} />
                    <ThemedText style={styles.sectionTitle}>Medical History</ThemedText>
                  </View>
                  <View style={styles.medicalList}>
                    {member.gh_medical_history_names.map((name, index) => (
                      <View key={index} style={styles.medicalItem}>
                        <Ionicons name="medical" size={12} color={theme.colors.danger} />
                        <ThemedText style={styles.medicalText}>
                          {name || 'Unknown condition'}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Women's Health */}
              {isFemale && (
                <View style={styles.womensHealthSection}>
                  <View style={styles.womensHealthTitleRow}>
                    <Ionicons name="flower-outline" size={16} color={theme.colors.female} />
                    <ThemedText style={[styles.sectionTitle, { color: theme.colors.female }]}>
                      Women's Health
                    </ThemedText>
                  </View>

                  {member.gh_age_of_menarche && (
                    <View style={styles.infoRow}>
                      <ThemedText style={styles.infoLabel}>Age of Menarche</ThemedText>
                      <ThemedText style={styles.infoValue}>{member.gh_age_of_menarche} years</ThemedText>
                    </View>
                  )}

                  {member.gh_last_menstrual_period && (
                    <View style={styles.infoRow}>
                      <ThemedText style={styles.infoLabel}>Last Menstrual Period</ThemedText>
                      <ThemedText style={styles.infoValue}>
                        {new Date(member.gh_last_menstrual_period).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  )}

                  {member.gh_fp_method_yn !== null && (
                    <View style={styles.fpSection}>
                      <View style={styles.infoRow}>
                        <View style={styles.fpLabelRow}>
                          <Ionicons name="medical-outline" size={14} color={theme.colors.textSecondary} />
                          <ThemedText style={styles.infoLabel}>Family Planning</ThemedText>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          member.gh_fp_method_yn ? styles.activeBadge : styles.inactiveBadge
                        ]}>
                          <ThemedText style={styles.statusText}>
                            {member.gh_fp_method_yn ? 'Active' : 'Inactive'}
                          </ThemedText>
                        </View>
                      </View>

                      {member.gh_fp_method_yn && (
                        <>
                          {member.gh_fp_method_name && (
                            <View style={styles.infoRow}>
                              <ThemedText style={styles.infoLabel}>Method</ThemedText>
                              <ThemedText style={styles.infoValue}>{member.gh_fp_method_name}</ThemedText>
                            </View>
                          )}
                          {member.gh_fp_status_name && (
                            <View style={styles.infoRow}>
                              <ThemedText style={styles.infoLabel}>Status</ThemedText>
                              <ThemedText style={styles.infoValue}>{member.gh_fp_status_name}</ThemedText>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Update Button */}
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push(
                  `/(bhw)/family/${family_id}/member/${member_id}/update-general-health` as any
                )}
                android_ripple={{ color: theme.colors.primaryLight }}
              >
                <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.actionButtonText}>Update Health Profile</ThemedText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.createButton}
              onPress={() => router.push(
                `/(bhw)/family/${family_id}/member/${member_id}/add-general-health` as any
              )}
              android_ripple={{ color: theme.colors.primaryLight }}
            >
              <View style={styles.createButtonContent}>
                <ThemedText style={styles.createButtonTitle}>Create Health Profile</ThemedText>
                <ThemedText style={styles.createButtonSubtitle}>
                  Add comprehensive health information for this member
                </ThemedText>
              </View>
              <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
            </Pressable>
          )}
        </View>

        {/* Record Information */}
        <View style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
            <ThemedText style={styles.recordTitle}>Record Information</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.recordLabel}>Created</ThemedText>
            <ThemedText style={styles.recordValue}>{formatDate(member.date_added)}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.recordLabel}>Created by</ThemedText>
            <ThemedText style={styles.recordValue}>
              {member.added_by_full_name || `User #${member.added_by_id}`}
            </ThemedText>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Profile Card
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  memberName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  memberCode: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  genderBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.xs,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Cards
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  notProvided: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },

  // Status Badges
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.lg,
  },
  principalBadge: {
    backgroundColor: theme.colors.success,
  },
  dependentBadge: {
    backgroundColor: theme.colors.primary,
  },
  activeBadge: {
    backgroundColor: theme.colors.success,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.disabled,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Nutrition
  nutritionCard: {
    paddingVertical: theme.spacing.md,
  },
  nutritionStatus: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Health Content
  healthContent: {
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },

  // Lifestyle - Enhanced
  lifestyleSection: {
    marginTop: theme.spacing.lg,
  },
  lifestyleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  lifestyleGrid: {
    gap: theme.spacing.md,
  },
  lifestyleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lifestyleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  lifestyleLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  lifestyleAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  lifestyleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeIndicator: {
    backgroundColor: theme.colors.success,
  },
  cautionIndicator: {
    backgroundColor: theme.colors.warning,
  },
  riskIndicator: {
    backgroundColor: theme.colors.danger,
  },
  neutralIndicator: {
    backgroundColor: theme.colors.primary,
  },
  unknownIndicator: {
    backgroundColor: theme.colors.disabled,
  },
  lifestyleValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  safeValue: {
    color: theme.colors.success,
  },
  cautionValue: {
    color: theme.colors.warning,
  },
  riskValue: {
    color: theme.colors.danger,
  },
  neutralValue: {
    color: theme.colors.primary,
  },
  unknownValue: {
    color: theme.colors.textMuted,
  },

  // Medical History
  medicalSection: {
    marginTop: theme.spacing.lg,
  },
  medicalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  medicalList: {
    gap: theme.spacing.sm,
  },
  medicalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.dangerLight,
    borderRadius: theme.radius.md,
  },
  medicalText: {
    fontSize: 13,
    color: theme.colors.danger,
    fontWeight: '500',
    flex: 1,
  },

  // Women's Health
  womensHealthSection: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.femaleLight,
    borderRadius: theme.radius.lg,
  },
  womensHealthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  fpSection: {
    marginTop: theme.spacing.md,
  },
  fpLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  // Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  createButtonContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  createButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  createButtonSubtitle: {
    fontSize: 12,
    color: theme.colors.primary,
    opacity: 0.8,
  },

  // Record Card
  recordCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  recordLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  recordValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
});