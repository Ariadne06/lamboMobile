import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    male: '#3B82F6',
    female: '#EC4899',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F59E0B',
    teal: '#14B8A6',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface ChildHealthData {
  child_health_id: number;
  child_id: number;
  child_full_name: string;
  sex: string;
  dob: string;
  time_of_birth?: string;
  birth_weight_kg?: number;
  birth_length_cm?: number;
  place_of_delivery?: string;
  address_landmark?: string;
  tt_status_id?: number;
  tt_status_name?: string;
  tt_status_date?: string;
  newborn_screening_status?: boolean;
  newborn_screening_status_date?: string;
  feeding_method_id?: number;
  feeding_method_name?: string;
  complete_address?: string;
  mother_phone_number?: string;
  father_phone_number?: string;
  philhealth_no?: string;
  mother_id?: number;
  mother_full_name?: string;
  mother_age_years?: number;
  father_id?: number;
  father_full_name?: string;
  father_age_years?: number;
  created_by: number;
  created_at: string;
  updated_at?: string;
}

export default function NurseChildHealthDetailScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [childData, setChildData] = useState<ChildHealthData | null>(null);

  useEffect(() => {
    fetchChildHealthDetail();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push('/(nurse)/child-health');
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [])
  );

  const fetchChildHealthDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/`
      );
      const data = await response.json();

      if (data.success) {
        setChildData(data.data);
      } else {
        Alert.alert('Error', data.error || 'Failed to load child health record');
      }
    } catch (error) {
      console.error('Failed to load child health record:', error);
      Alert.alert('Error', 'Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '—';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateAge = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'} old`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Child Health Record" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading record...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!childData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Child Health Record" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.textMuted} />
          <ThemedText style={styles.emptyText}>Record not found</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Child Health Record" onBackPress={handleBackPress} />

      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.profileAvatar,
              { backgroundColor: childData.sex === 'Male' ? `${theme.colors.male}20` : `${theme.colors.female}20` },
            ]}
          >
            <Ionicons
              name="person"
              size={48}
              color={childData.sex === 'Male' ? theme.colors.male : theme.colors.female}
            />
          </View>
          <ThemedText style={styles.profileName}>{childData.child_full_name}</ThemedText>
          <View style={styles.profileMeta}>
            <View
              style={[
                styles.genderBadge,
                { backgroundColor: childData.sex === 'Male' ? `${theme.colors.male}20` : `${theme.colors.female}20` },
              ]}
            >
              <Ionicons
                name={childData.sex === 'Male' ? 'male' : 'female'}
                size={14}
                color={childData.sex === 'Male' ? theme.colors.male : theme.colors.female}
              />
              <ThemedText
                style={[
                  styles.genderText,
                  { color: childData.sex === 'Male' ? theme.colors.male : theme.colors.female },
                ]}
              >
                {childData.sex}
              </ThemedText>
            </View>
            <ThemedText style={styles.ageText}>{calculateAge(childData.dob)}</ThemedText>
          </View>
          <ThemedText style={styles.childCode}>ID: {childData.child_health_id}</ThemedText>
        </View>

        {/* Basic Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Basic Information</ThemedText>
          </View>
          <InfoRow icon="calendar" label="Date of Birth" value={formatDate(childData.dob)} />
          <InfoRow icon="time" label="Time of Birth" value={formatTime(childData.time_of_birth)} />
          <InfoRow icon="location" label="Place of Delivery" value={childData.place_of_delivery || '—'} />
          <InfoRow
            icon="location-outline"
            label="Address Landmark"
            value={childData.address_landmark || '—'}
            multiline
          />
        </View>

        {/* Birth Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="child-care" size={20} color={theme.colors.success} />
            <ThemedText style={styles.cardTitle}>Birth Details</ThemedText>
          </View>
          <InfoRow
            icon="barbell"
            label="Birth Weight"
            value={childData.birth_weight_kg ? `${childData.birth_weight_kg} kg` : '—'}
          />
          <InfoRow
            icon="resize"
            label="Birth Length"
            value={childData.birth_length_cm ? `${childData.birth_length_cm} cm` : '—'}
          />
        </View>

        {/* Health Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={20} color={theme.colors.info} />
            <ThemedText style={styles.cardTitle}>Health Status</ThemedText>
          </View>

          {/* TT Status */}
          <View style={styles.statusRow}>
            <View style={styles.statusLabel}>
              <Ionicons name="shield-checkmark" size={16} color={theme.colors.textSecondary} />
              <ThemedText style={styles.statusLabelText}>TT Status (Mother)</ThemedText>
            </View>
            {childData.tt_status_name ? (
              <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.success}20` }]}>
                <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} />
                <ThemedText style={[styles.statusBadgeText, { color: theme.colors.success }]}>
                  {childData.tt_status_name}
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.mutedText}>Not recorded</ThemedText>
            )}
          </View>

          {/* Newborn Screening */}
          <View style={styles.statusRow}>
            <View style={styles.statusLabel}>
              <Ionicons name="fitness" size={16} color={theme.colors.textSecondary} />
              <ThemedText style={styles.statusLabelText}>Newborn Screening</ThemedText>
            </View>
            {childData.newborn_screening_status !== null ? (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: childData.newborn_screening_status
                      ? `${theme.colors.success}20`
                      : `${theme.colors.textMuted}20`,
                  },
                ]}
              >
                <Ionicons
                  name={childData.newborn_screening_status ? 'checkmark-circle' : 'close-circle'}
                  size={12}
                  color={childData.newborn_screening_status ? theme.colors.success : theme.colors.textMuted}
                />
                <ThemedText
                  style={[
                    styles.statusBadgeText,
                    {
                      color: childData.newborn_screening_status ? theme.colors.success : theme.colors.textMuted,
                    },
                  ]}
                >
                  {childData.newborn_screening_status ? 'Done' : 'Not Done'}
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.mutedText}>Not recorded</ThemedText>
            )}
          </View>

          {/* Feeding Method */}
          <View style={styles.statusRow}>
            <View style={styles.statusLabel}>
              <Ionicons name="restaurant" size={16} color={theme.colors.textSecondary} />
              <ThemedText style={styles.statusLabelText}>Feeding Method</ThemedText>
            </View>
            {childData.feeding_method_name ? (
              <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.info}20` }]}>
                <ThemedText style={[styles.statusBadgeText, { color: theme.colors.info }]}>
                  {childData.feeding_method_name}
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.mutedText}>Not recorded</ThemedText>
            )}
          </View>
        </View>

        {/* Parent Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={20} color={theme.colors.purple} />
            <ThemedText style={styles.cardTitle}>Parent Information</ThemedText>
          </View>

          {/* Mother */}
          <View style={styles.parentSection}>
            <View style={styles.parentHeader}>
              <Ionicons name="woman" size={16} color={theme.colors.pink} />
              <ThemedText style={styles.parentHeaderText}>Mother</ThemedText>
            </View>
            <InfoRow icon="person" label="Name" value={childData.mother_full_name || '—'} />
            <InfoRow
              icon="calendar"
              label="Age"
              value={childData.mother_age_years ? `${childData.mother_age_years} years old` : '—'}
            />
            <InfoRow icon="call" label="Phone" value={childData.mother_phone_number || '—'} />
          </View>

          <View style={styles.parentDivider} />

          {/* Father */}
          <View style={styles.parentSection}>
            <View style={styles.parentHeader}>
              <Ionicons name="man" size={16} color={theme.colors.male} />
              <ThemedText style={styles.parentHeaderText}>Father</ThemedText>
            </View>
            <InfoRow icon="person" label="Name" value={childData.father_full_name || '—'} />
            <InfoRow
              icon="calendar"
              label="Age"
              value={childData.father_age_years ? `${childData.father_age_years} years old` : '—'}
            />
            <InfoRow icon="call" label="Phone" value={childData.father_phone_number || '—'} />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="call" size={20} color={theme.colors.orange} />
            <ThemedText style={styles.cardTitle}>Contact Information</ThemedText>
          </View>
          <InfoRow icon="location" label="Address" value={childData.complete_address || '—'} multiline />
          <InfoRow icon="card" label="PhilHealth No." value={childData.philhealth_no || '—'} />
        </View>

        {/* Action Section - ALL MODULES (VIEW + ADD IMMUNIZATION) */}
        <View style={styles.actionSection}>
            <ThemedText style={styles.sectionTitle}>Health Management</ThemedText>

            {/* Immunization - CAN ADD */}
            <TouchableOpacity
                style={[styles.actionButtonFull, { backgroundColor: theme.colors.info }]}
                onPress={() => router.push(`/(nurse)/child-health/${child_health_id}/immunization` as any)}
            >
                <Ionicons name="medical" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonFullText}>Immunization Records</ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Growth Monitoring - VIEW ONLY */}
            <TouchableOpacity
                style={[styles.actionButtonFull, { backgroundColor: theme.colors.success }]}
                onPress={() => router.push(`/(nurse)/child-health/${child_health_id}/growth-monitoring` as any)}
            >
                <Ionicons name="fitness" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonFullText}>Growth Monitoring</ThemedText>
                <View style={styles.viewOnlyBadge}>
                <Ionicons name="eye" size={12} color="#FFFFFF" />
                <ThemedText style={styles.viewOnlyText}>View Only</ThemedText>
                </View>
            </TouchableOpacity>

            {/* Exclusive Breastfeed - VIEW ONLY */}
            <TouchableOpacity
                style={[styles.actionButtonFull, { backgroundColor: theme.colors.pink }]}
                onPress={() => router.push(`/(nurse)/child-health/${child_health_id}/exclusive-breastfeed` as any)}
            >
                <Ionicons name="heart" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonFullText}>Exclusive Breastfeed</ThemedText>
                <View style={styles.viewOnlyBadge}>
                <Ionicons name="eye" size={12} color="#FFFFFF" />
                <ThemedText style={styles.viewOnlyText}>View Only</ThemedText>
                </View>
            </TouchableOpacity>

            {/* Supplements - VIEW ONLY */}
            <TouchableOpacity
                style={[styles.actionButtonFull, { backgroundColor: theme.colors.orange }]}
                onPress={() => router.push(`/(nurse)/child-health/${child_health_id}/supplements` as any)}
            >
                <Ionicons name="medical-outline" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonFullText}>Supplements</ThemedText>
                <View style={styles.viewOnlyBadge}>
                <Ionicons name="eye" size={12} color="#FFFFFF" />
                <ThemedText style={styles.viewOnlyText}>View Only</ThemedText>
                </View>
            </TouchableOpacity>

            {/* Medical & Surgical History - VIEW ONLY */}
            <TouchableOpacity
                style={[styles.actionButtonFull, { backgroundColor: theme.colors.danger }]}
                onPress={() => router.push(`/(nurse)/child-health/${child_health_id}/medical-surgical-history` as any)}
            >
                <Ionicons name="document-text" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonFullText}>Medical & Surgical History</ThemedText>
                <View style={styles.viewOnlyBadge}>
                <Ionicons name="eye" size={12} color="#FFFFFF" />
                <ThemedText style={styles.viewOnlyText}>View Only</ThemedText>
                </View>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string | number;
  multiline?: boolean;
  muted?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, multiline, muted }) => (
  <View style={[styles.infoRow, multiline && styles.infoRowMultiline]}>
    <View style={styles.infoLabel}>
      <Ionicons name={icon as any} size={16} color={theme.colors.textSecondary} />
      <ThemedText style={styles.labelText}>{label}:</ThemedText>
    </View>
    <ThemedText style={[styles.valueText, multiline && styles.valueTextMultiline, muted && styles.mutedText]}>
      {value}
    </ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ageText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  childCode: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  parentSection: {
    marginBottom: theme.spacing.md,
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  parentHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  parentDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  labelText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  valueTextMultiline: {
    textAlign: 'left',
    marginTop: theme.spacing.sm,
    width: '100%',
  },
  mutedText: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusLabelText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  actionButtonFullText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  viewOnlyBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.25)',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  gap: 4,
},
viewOnlyText: {
  fontSize: 10,
  color: '#FFFFFF',
  fontWeight: '600',
},
});