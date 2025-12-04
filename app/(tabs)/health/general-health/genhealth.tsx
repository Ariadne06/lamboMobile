import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Text,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { useRouter } from 'expo-router';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface GeneralHealthData {
  family_member_id: number;
  resident_id: number;
  full_name: string;
  sex: string;
  age: string;
  family_code: string;
  class_description: string;
  medical_history: string[] | null;
  smoker: boolean | null;
  alcohol_drinker: boolean | null;
  sexually_active: boolean | null;
  last_menstrual_period?: string | null;
  fp_method_yn?: boolean | null;
  fp_method_name?: string | null;
  fp_status_name?: string | null;
  age_of_menarche?: number | null;
  quarter_name?: string;
  created_at?: string;
  updated_at?: string;
}

export default function GeneralHealthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<GeneralHealthData | null>(null);
  const [residentName, setResidentName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGeneralHealth();
  }, []);

  const loadGeneralHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Getting user session...');
      const session = await getUserSession();
      console.log('📱 Session:', session);

      if (!session) {
        setError('No session found. Please log in again.');
        Alert.alert('Session Error', 'Unable to load user session. Please log in again.');
        return;
      }

      if (!session.user_id) {
        setError('No user ID found in session.');
        Alert.alert('Error', 'No user ID found. Please contact support.');
        return;
      }

      const url = `${API_BASE_URL}/household_api/residents/${session.user_id}/general-health/`;
      console.log('🌐 Fetching from:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('📋 General health response:', JSON.stringify(data, null, 2));

      if (data.success) {
        if (data.data) {
          // ✅ FIX: Ensure medical_history is always an array
          const healthDataWithSafeMedicalHistory = {
            ...data.data,
            medical_history: Array.isArray(data.data.medical_history) 
              ? data.data.medical_history 
              : (data.data.medical_history ? [data.data.medical_history] : [])
          };
          
          setHealthData(healthDataWithSafeMedicalHistory);
          setResidentName(data.data.full_name || '');
          console.log('✅ Health data processed:', healthDataWithSafeMedicalHistory);
        } else {
          setHealthData(null);
          setResidentName('');
        }
      } else {
        setError(data.error || 'Failed to load general health data');
        console.error('❌ Failed to load general health:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading general health:', error);
      setError('Network error. Please check your connection.');
      Alert.alert('Error', 'Failed to load general health information. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGeneralHealth();
  };

  const handleBackPress = () => {
    router.back();
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const getYesNoDisplay = (value: boolean | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    return value ? 'Yes' : 'No';
  };

  // ✅ FIX: Safe medical history rendering function
  const renderMedicalHistory = (medicalHistory: string[] | null | undefined) => {
    if (!medicalHistory || !Array.isArray(medicalHistory) || medicalHistory.length === 0) {
      return <Text style={styles.noDataText}>No medical history recorded</Text>;
    }

    return (
      <View style={styles.medicalHistoryList}>
        {medicalHistory.map((condition, index) => (
          <View key={index} style={styles.medicalHistoryItem}>
            <Ionicons name="medical" size={16} color={theme.colors.warning} />
            <Text style={styles.medicalHistoryText}>{condition}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="General Health" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="General Health" onBackPress={handleBackPress} />
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
          }
        >
          <Ionicons name="alert-circle" size={64} color={theme.colors.warning} />
          <Text style={styles.errorTitle}>Unable to Load Data</Text>
          <Text style={styles.errorText}>{error}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="General Health" onBackPress={handleBackPress} />

      {residentName && (
        <View style={styles.bannerCard}>
          <MaterialCommunityIcons name="heart-pulse" size={28} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <Text style={styles.residentName}>{residentName}</Text>
            <Text style={styles.bannerSubtext}>General Health Information</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !healthData && styles.scrollContentCentered,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {!healthData ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={80} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Health Record Found</Text>
            <Text style={styles.emptySubtext}>
              Your general health information has not been recorded yet. Please contact your Barangay Health Worker.
            </Text>
          </View>
        ) : (
          <>
            {/* Basic Information */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Basic Information</Text>
              </View>

              <InfoRow label="Sex" value={healthData.sex} />
              <InfoRow label="Age" value={healthData.age} />
              <InfoRow label="Family Code" value={healthData.family_code || 'N/A'} />
              <InfoRow label="Classification" value={healthData.class_description || 'N/A'} />
              {healthData.quarter_name && (
                <InfoRow label="Quarter" value={healthData.quarter_name} />
              )}
            </View>

            {/* Medical History */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="medical-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Medical History</Text>
              </View>
              {/* ✅ FIX: Use safe rendering function */}
              {renderMedicalHistory(healthData.medical_history)}
            </View>

            {/* Lifestyle Information */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Lifestyle</Text>
              </View>

              <InfoRow label="Smoker" value={getYesNoDisplay(healthData.smoker)} />
              <InfoRow label="Alcohol Drinker" value={getYesNoDisplay(healthData.alcohol_drinker)} />
              <InfoRow label="Sexually Active" value={getYesNoDisplay(healthData.sexually_active)} />
            </View>

            {/* Female-Specific Information */}
            {healthData.sex?.toLowerCase() === 'female' && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="gender-female" size={20} color={theme.colors.primary} />
                  <Text style={styles.cardTitle}>Reproductive Health</Text>
                </View>

                {healthData.age_of_menarche && (
                  <InfoRow label="Age of Menarche" value={`${healthData.age_of_menarche} years old`} />
                )}
                {healthData.last_menstrual_period && (
                  <InfoRow label="Last Menstrual Period" value={formatDate(healthData.last_menstrual_period)} />
                )}
                
                <View style={styles.fpSection}>
                  <Text style={styles.fpSectionTitle}>Family Planning</Text>
                  <InfoRow label="Using FP Method" value={getYesNoDisplay(healthData.fp_method_yn)} />
                  
                  {healthData.fp_method_yn && (
                    <>
                      {healthData.fp_method_name && (
                        <InfoRow label="FP Method" value={healthData.fp_method_name} />
                      )}
                      {healthData.fp_status_name && (
                        <InfoRow label="FP Status" value={healthData.fp_status_name} />
                      )}
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Record Information */}
            {healthData.created_at && (
              <View style={styles.recordInfo}>
                <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
                <Text style={styles.recordInfoText}>
                  Recorded on {formatDate(healthData.created_at)}
                </Text>
                {healthData.updated_at && healthData.updated_at !== healthData.created_at && (
                  <>
                    <Ionicons name="sync-outline" size={12} color={theme.colors.textMuted} style={{ marginLeft: 12 }} />
                    <Text style={styles.recordInfoText}>
                      Updated {formatDate(healthData.updated_at)}
                    </Text>
                  </>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: { fontSize: 14, color: theme.colors.textSecondary },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  bannerInfo: { flex: 1 },
  residentName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
  bannerSubtext: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },

  scrollView: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl * 2 },
  scrollContentCentered: { flexGrow: 1, justifyContent: 'center' },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    lineHeight: 20,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },

  medicalHistoryList: { gap: theme.spacing.sm },
  medicalHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
  },
  medicalHistoryText: { fontSize: 14, color: theme.colors.textPrimary, flex: 1 },
  noDataText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },

  fpSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  fpSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },

  recordInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md,
  },
  recordInfoText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
});