import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#EC4899',
    primaryLight: '#FDF2F8',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    info: '#3B82F6',
    danger: '#EF4444',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface MaternalHealthData {
  maternal_health_id: number;
  maternal_id: number;
  registration_date: string;
  family_code: string;
  nhts_status: boolean;
  full_name: string;
  dob: string;
  age_years: number;
  full_address: string;
  address_landmark: string | null;
  phone_number: string | null;
  record_status_id: number;
  record_status: string;
  created_by: number;
  created_at: string;
  updated_at: string | null;
}

export default function ResidentMaternalHealthOverview() {
  const router = useRouter();
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [maternalData, setMaternalData] = useState<MaternalHealthData | null>(null);

  useEffect(() => {
    fetchMaternalHealthDetail();
  }, [maternal_health_id]);

  const fetchMaternalHealthDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_RECORD_DETAIL(parseInt(maternal_health_id))}`
      );
      const data = await response.json();

      console.log('📋 Maternal detail response:', data);

      if (data.success) {
        setMaternalData(data.data);
      } else {
        console.error('Failed to load maternal record:', data.error);
        Alert.alert('Error', 'Failed to load maternal health record');
      }
    } catch (error) {
      console.error('Fetch maternal detail error:', error);
      Alert.alert('Error', 'Failed to load maternal health record');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMaternalHealthDetail();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return theme.colors.textMuted;
    
    switch (status.toLowerCase()) {
      case 'ongoing':
        return theme.colors.info;
      case 'completed':
        return theme.colors.success;
      default:
        return theme.colors.textMuted;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="My Maternal Health Record" onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading your health record...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!maternalData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="My Maternal Health Record" onBackPress={() => router.back()} />
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={64} color={theme.colors.textMuted} />
          <ThemedText style={styles.emptyText}>Record not found</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="My Maternal Health Record" onBackPress={() => router.back()} />

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <MaterialIcons name="pregnant-woman" size={48} color={theme.colors.primary} />
          </View>
          <ThemedText style={styles.profileName}>{maternalData.full_name}</ThemedText>
          <View style={styles.profileMeta}>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(maternalData.record_status)}20` }]}>
              <Ionicons
                name={maternalData.record_status?.toLowerCase() === 'ongoing' ? 'time-outline' : 'checkmark-circle-outline'}
                size={16}
                color={getStatusColor(maternalData.record_status)}
              />
              <ThemedText style={[styles.statusText, { color: getStatusColor(maternalData.record_status) }]}>
                {maternalData.record_status || 'Unknown'}
              </ThemedText>
            </View>
          </View>
          {/* <ThemedText style={styles.recordId}>Record ID: {maternalData.maternal_health_id}</ThemedText> */}
        </View>

        {/* Basic Information Card */}
        {/* <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Basic Information</ThemedText>
          </View>

          <InfoRow icon="person-outline" label="Mother ID" value={maternalData.maternal_id.toString()} />
          <InfoRow icon="calendar-outline" label="Date of Birth" value={formatDate(maternalData.dob)} />
          <InfoRow icon="calendar-outline" label="Age" value={`${maternalData.age_years} years old`} />
          <InfoRow icon="home-outline" label="Family Code" value={maternalData.family_code || 'N/A'} />
          <InfoRow 
            icon="shield-checkmark-outline" 
            label="NHTS Status" 
            value={maternalData.nhts_status ? 'Yes' : 'No'} 
          />
          <InfoRow 
            icon="location-outline" 
            label="Address" 
            value={maternalData.full_address} 
            multiline 
          />
          {maternalData.address_landmark && (
            <InfoRow 
              icon="navigate-outline" 
              label="Landmark" 
              value={maternalData.address_landmark} 
              multiline 
            />
          )}
          {maternalData.phone_number && (
            <InfoRow icon="call-outline" label="Phone" value={maternalData.phone_number} />
          )}
        </View> */}

        {/* Record Information Card */}
        {/* <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Record Information</ThemedText>
          </View>

          <InfoRow icon="calendar-outline" label="Registration Date" value={formatDate(maternalData.registration_date)} />
          <InfoRow icon="calendar-outline" label="Created" value={formatDate(maternalData.created_at)} />
          {maternalData.updated_at && (
            <InfoRow icon="calendar-outline" label="Last Updated" value={formatDate(maternalData.updated_at)} />
          )}
        </View> */}

        {/* Health Tracking Section - READ ONLY */}
        <View style={styles.actionSection}>
          <ThemedText style={styles.sectionTitle}>Health Tracking</ThemedText>
          
          {/* Obstetrical History */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push(`/(tabs)/health/maternal/${maternal_health_id}/obstetricalhistory` as any)}
          >
            <Ionicons name="medical" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Obstetrical History</ThemedText>
          </TouchableOpacity>

          {/* Immunization (TT Status) */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: '#8B5CF6' }]}
            onPress={() => router.push(`/(tabs)/health/maternal/${maternal_health_id}/immunization` as any)}
          >
            <MaterialIcons name="vaccines" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>TT Immunization</ThemedText>
          </TouchableOpacity>

          {/* Trimester Checkups */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: '#10B981' }]}
            onPress={() => router.push(`/(tabs)/health/maternal/${maternal_health_id}/checkups` as any)}
          >
            <Ionicons name="heart-circle" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Trimester Checkups</ThemedText>
          </TouchableOpacity>

          {/* Supplements & Deworming */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: '#F59E0B' }]}
            onPress={() => router.push(`/(tabs)/health/maternal/${maternal_health_id}/supplements` as any)}
          >
            <Ionicons name="fitness" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Supplements & Deworming</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Medical History Section - READ ONLY */}
        <View style={styles.actionSection}>
          <ThemedText style={styles.sectionTitle}>Medical History</ThemedText>
          
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: '#DC2626' }]}
            onPress={() => router.push(`/(tabs)/health/maternal/${maternal_health_id}/medical-surgical-history` as any)}
          >
            <Ionicons name="document-text" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Medical & Surgical History</ThemedText>
          </TouchableOpacity>

          {/* Disease Surveillance - VIEW ONLY */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: '#6366F1' }]}
            onPress={() => router.push(`/(tabs)/health/maternal/${maternal_health_id}/disease-surveillance` as any)}
          >
            <Ionicons name="eye" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Disease Surveillance</ThemedText>
          </TouchableOpacity>

          {/* Laboratory Screening - VIEW ONLY */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: '#0891B2' }]}
            onPress={() => router.push(`/(tabs)/health/maternal/${maternal_health_id}/laboratory-screening` as any)}
          >
            <Ionicons name="flask" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Laboratory Screening</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Pregnancy Outcome Section - READ ONLY */}
        <View style={styles.actionSection}>
          <ThemedText style={styles.sectionTitle}>Pregnancy Outcome</ThemedText>
          
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: '#EC4899' }]}
            onPress={() => router.push(`/(tabs)/health/maternal/${maternal_health_id}/pregnancy-outcome` as any)}
          >
            <Ionicons name="happy" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Pregnancy Outcome</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: '#14B8A6' }]}
            onPress={() => router.push(`/(tabs)/health/maternal/${maternal_health_id}/postpartum-visits` as any)}
          >
            <Ionicons name="woman" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Postpartum Visits</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Info Footer */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <ThemedText style={styles.infoText}>
            All maternal health records are maintained by your Barangay Health Worker and Midwife. 
            For questions or updates, please contact them directly.
          </ThemedText>
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
    <ThemedText 
      style={[
        styles.valueText, 
        multiline && styles.valueTextMultiline,
        muted && styles.mutedText
      ]}
    >
      {value || '—'}
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
    backgroundColor: theme.colors.primaryLight,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recordId: {
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
  viewOnlyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F1F5F9',
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});