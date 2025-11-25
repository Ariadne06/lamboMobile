import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    primary: '#3B82F6',
    primaryLight: '#EFF6FF',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#0891B2',
    infoLight: '#E0F7FA',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    male: '#3B82F6',
    female: '#EC4899',
    femaleLight: '#FDF2F8',
  },
  spacing: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  }
};

interface GeneralHealthDetail {
  record_id: number;
  family_member_id: number;
  resident_id: number;
  full_name: string;
  sex: string;
  age: number;
  philhealthid_number?: string;
  family_code: string;
  class_id: number;
  class_description: string;
  medical_history_ids: any;
  medical_history_names: string[];
  last_menstrual_period?: string;
  fp_method_yn?: boolean;
  fp_method_id?: number;
  fp_method_name?: string;
  fp_status_id?: number;
  fp_status_name?: string;
  age_of_menarche?: number;
  smoker?: boolean;
  alcohol_drinker?: boolean;
  sexually_active?: boolean;
  created_at: string;
  updated_at: string;
  added_by_full_name: string;
  quarter_id: number;
}

export default function GeneralHealthDetailScreen() {
  const { family_member_id } = useLocalSearchParams<{ family_member_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<GeneralHealthDetail | null>(null);
  const [hasRecord, setHasRecord] = useState(false);

  useEffect(() => {
    fetchHealthDetail();
  }, [family_member_id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchHealthDetail();
    }, [family_member_id])
  );

  const handleBackPress = () => {
    router.push('/(bhw)/general-health');
  };

  const fetchHealthDetail = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.GENERAL_HEALTH_DETAIL(parseInt(family_member_id))}`
      );
      const data = await response.json();

      console.log('🔍 API Response:', data); // Debug log
      console.log('📋 PhilHealth No:', data.data?.philhealthid_number); // Check PhilHealth

      if (data.success) {
        setHasRecord(data.has_record);
        
        if (data.has_record && data.data) {
          setHealthData(data.data);
        } else {
          setHealthData(null);
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to load health record');
      }
    } catch (error) {
      console.error('Failed to load health detail:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealthDetail();
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not recorded';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getLifestyleIcon = (value: boolean | undefined): { 
    icon: string; 
    color: string; 
    text: string;
  } => {
    if (value === true) {
      return { 
        icon: 'close-circle', 
        color: theme.colors.danger, 
        text: 'Yes'
      };
    } else if (value === false) {
      return { 
        icon: 'checkmark-circle', 
        color: theme.colors.success, 
        text: 'No'
      };
    }
    return { 
      icon: 'help-circle', 
      color: theme.colors.textMuted, 
      text: 'Not specified'
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader 
          title="General Health Detail" 
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading health record...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasRecord || !healthData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader 
          title="General Health Detail" 
          onBackPress={handleBackPress}
        />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialIcons name="health-and-safety" size={48} color={theme.colors.textMuted} />
          </View>
          <ThemedText style={styles.emptyTitle}>No Health Record</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            No general health record found for the current quarter
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const isFemale = healthData.sex.toLowerCase() === 'female';
  const smokerStatus = getLifestyleIcon(healthData.smoker);
  const alcoholStatus = getLifestyleIcon(healthData.alcohol_drinker);
  const sexuallyActiveStatus = getLifestyleIcon(healthData.sexually_active);

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="General Health Detail" 
        onBackPress={handleBackPress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* ✅ Simplified Profile - Just Name */}
        {/* <View style={styles.profileCard}>
          <ThemedText style={styles.profileName}>{healthData.full_name}</ThemedText>
        </View> */}

        {/* ✅ Basic Information - Now includes Age, Sex, Family Code, PhilHealth */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="badge" size={16} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Basic Information</ThemedText>
          </View>

          <View style={styles.infoGrid}>
            {/* Full Name */}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Full Name</ThemedText>
              <ThemedText style={styles.infoValue}>{healthData.full_name}</ThemedText>
            </View>
            {/* Age */}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Age</ThemedText>
              <ThemedText style={styles.infoValue}>{healthData.age} years old</ThemedText>
            </View>

            {/* Sex */}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Sex</ThemedText>
              <View style={[
                styles.genderBadge,
                { backgroundColor: isFemale ? theme.colors.femaleLight : theme.colors.primaryLight }
              ]}>
                <Ionicons 
                  name={isFemale ? 'female' : 'male'} 
                  size={12} 
                  color={isFemale ? theme.colors.female : theme.colors.male} 
                />
                <ThemedText style={[
                  styles.genderText,
                  { color: isFemale ? theme.colors.female : theme.colors.male }
                ]}>
                  {healthData.sex}
                </ThemedText>
              </View>
            </View>

            {/* Family Code */}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Family Code</ThemedText>
              <ThemedText style={styles.infoValue}>{healthData.family_code}</ThemedText>
            </View>

            {/* Resident ID */}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Resident ID</ThemedText>
              <ThemedText style={styles.infoValue}>
                R{healthData.resident_id.toString().padStart(5, '0')}
              </ThemedText>
            </View>

            {/* ✅ PhilHealth Number */}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>PhilHealth No.</ThemedText>
              {healthData.philhealthid_number ? (
                <View style={styles.philhealthBadge}>
                  <MaterialIcons name="card-membership" size={12} color={theme.colors.info} />
                  <ThemedText style={styles.philhealthText}>
                    {healthData.philhealthid_number}
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.infoValueMuted}>Not recorded</ThemedText>
              )}
            </View>

            {/* Classification */}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Classification</ThemedText>
              <ThemedText style={styles.infoValue}>{healthData.class_description  }</ThemedText>
              {/* <View style={styles.classBadge}>
                <ThemedText style={styles.classText}>
                  {healthData.class_description}
                </ThemedText>
              </View> */}
            </View>
          </View>
        </View>

        {/* ✅ Medical History */}
        {healthData.medical_history_names && healthData.medical_history_names.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="medical-services" size={16} color={theme.colors.danger} />
              <ThemedText style={styles.cardTitle}>Medical History</ThemedText>
              <View style={styles.countBadge}>
                <ThemedText style={styles.countText}>
                  {healthData.medical_history_names.length}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.conditionsList}>
              {healthData.medical_history_names.map((condition, index) => (
                <View key={index} style={styles.conditionItem}>
                  <View style={styles.conditionDot} />
                  <ThemedText style={styles.conditionText}>{condition}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ✅ Lifestyle Factors - Vertical List (Not Grid) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="favorite" size={16} color={theme.colors.warning} />
            <ThemedText style={styles.cardTitle}>Lifestyle Factors</ThemedText>
          </View>
          
          <View style={styles.lifestyleList}>
            {/* Smoker */}
            <View style={styles.lifestyleRow}>
              <View style={styles.lifestyleLeft}>
                <MaterialIcons name="smoking-rooms" size={18} color={theme.colors.textSecondary} />
                <ThemedText style={styles.lifestyleLabel}>Smoker</ThemedText>
              </View>
              <View style={styles.lifestyleRight}>
                <ThemedText style={[styles.lifestyleValue, { color: smokerStatus.color }]}>
                  {smokerStatus.text}
                </ThemedText>
              </View>
            </View>

            {/* Alcohol Drinker */}
            <View style={styles.lifestyleRow}>
              <View style={styles.lifestyleLeft}>
                <MaterialIcons name="local-bar" size={18} color={theme.colors.textSecondary} />
                <ThemedText style={styles.lifestyleLabel}>Alcohol Drinker</ThemedText>
              </View>
              <View style={styles.lifestyleRight}>
                <ThemedText style={[styles.lifestyleValue, { color: alcoholStatus.color }]}>
                  {alcoholStatus.text}
                </ThemedText>
              </View>
            </View>

            {/* Sexually Active */}
            <View style={styles.lifestyleRow}>
              <View style={styles.lifestyleLeft}>
                <MaterialIcons name="favorite" size={18} color={theme.colors.textSecondary} />
                <ThemedText style={styles.lifestyleLabel}>Sexually Active</ThemedText>
              </View>
              <View style={styles.lifestyleRight}>
                <ThemedText style={[styles.lifestyleValue, { color: sexuallyActiveStatus.color }]}>
                  {sexuallyActiveStatus.text}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* ✅ Women's Health (Female Only) */}
        {isFemale && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="pregnant-woman" size={16} color={theme.colors.female} />
              <ThemedText style={styles.cardTitle}>Women's Health</ThemedText>
            </View>

            <View style={styles.infoGrid}>
              {healthData.age_of_menarche && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Age of Menarche</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {healthData.age_of_menarche} years old
                  </ThemedText>
                </View>
              )}

              {healthData.last_menstrual_period && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Last Menstrual Period</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {formatDate(healthData.last_menstrual_period)}
                  </ThemedText>
                </View>
              )}

              {healthData.fp_method_yn !== undefined && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Using Family Planning</ThemedText>
                    <ThemedText style={[
                      styles.infoValue,
                      { color: healthData.fp_method_yn ? theme.colors.success : theme.colors.textPrimary }
                    ]}>
                      {healthData.fp_method_yn ? 'Yes' : 'No'}
                    </ThemedText>
                  </View>

                  {healthData.fp_method_yn && (
                    <>
                      {healthData.fp_method_name && (
                        <View style={styles.infoRow}>
                          <ThemedText style={styles.infoLabel}>FP Method</ThemedText>
                          <ThemedText style={styles.infoValue}>
                            {healthData.fp_method_name}
                          </ThemedText>
                        </View>
                      )}
                      {healthData.fp_status_name && (
                        <View style={styles.infoRow}>
                          <ThemedText style={styles.infoLabel}>FP Status</ThemedText>
                          <ThemedText style={styles.infoValue}>
                            {healthData.fp_status_name}
                          </ThemedText>
                        </View>
                      )}
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        )}

        {/* ✅ Record Info */}
        <View style={styles.recordFooter}>
          <View style={styles.footerRow}>
            <Ionicons name="person-outline" size={12} color={theme.colors.textMuted} />
            <ThemedText style={styles.footerLabel}>Added by</ThemedText>
            <ThemedText style={styles.footerValue}>{healthData.added_by_full_name}</ThemedText>
          </View>
          
          <View style={styles.footerRow}>
            <Ionicons name="calendar-outline" size={12} color={theme.colors.textMuted} />
            <ThemedText style={styles.footerLabel}>Created</ThemedText>
            <ThemedText style={styles.footerValue}>{formatDate(healthData.created_at)}</ThemedText>
          </View>
        </View>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },

  // ✅ Simplified Profile - Just Name
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },

  // ✅ Cards
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
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: theme.colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.danger,
  },

  // ✅ Info Grid
  infoGrid: {
    gap: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  infoValueMuted: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },

  // ✅ Gender Badge
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: 4,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ✅ PhilHealth Badge
  philhealthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.infoLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: 4,
  },
  philhealthText: {
    fontSize: 11,
    color: theme.colors.info,
    fontWeight: '600',
  },

  // ✅ Class Badge
  classBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  classText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // ✅ Medical Conditions
  conditionsList: {
    gap: theme.spacing.sm,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  conditionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.danger,
    marginTop: 6,
  },
  conditionText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },

  // ✅ Lifestyle - Vertical List (Not Grid)
  lifestyleList: {
    gap: theme.spacing.xs,
  },
  lifestyleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  lifestyleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  lifestyleLabel: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  lifestyleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lifestyleValue: {
    fontSize: 13,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.sm,
  },

  // ✅ Footer
  recordFooter: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  footerLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  footerValue: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});