import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Pressable,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#8B5CF6',
    primaryLight: '#F3E8FF',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFF3CD',
    danger: '#EF4444',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface ImmunizationTrack {
  first_dose: boolean;
  first_dose_date: string | null;
  second_dose: boolean;
  second_dose_date: string | null;
  third_dose: boolean;
  third_dose_date: string | null;
  fourth_dose: boolean;
  fourth_dose_date: string | null;
  fifth_dose: boolean;
  fifth_dose_date: string | null;
  fim_status: boolean;
  updated_at: string | null;
}

export default function MaternalImmunizationScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackData, setTrackData] = useState<ImmunizationTrack | null>(null);
  const [maternalName, setMaternalName] = useState('');

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData(); // Refresh when screen comes into focus
      
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [maternal_health_id])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch maternal info
      const maternalResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const maternalData = await maternalResponse.json();

      if (maternalData.success) {
        setMaternalName(maternalData.data.full_name || '');
      }

      // Fetch immunization tracking
      const trackResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_IMMUNIZATION_TRACK(parseInt(maternal_health_id))}`
      );
      const trackDataResponse = await trackResponse.json();

      console.log('✅ Immunization track response:', trackDataResponse);

      if (trackDataResponse.success) {
        setTrackData(trackDataResponse.data);
      }
    } catch (error) {
      console.error('❌ Error loading immunization data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddDose = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/immunization/add-dose` as any);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateCompletion = (): number => {
    if (!trackData) return 0;
    
    const completedDoses = [
      trackData.first_dose,
      trackData.second_dose,
      trackData.third_dose,
      trackData.fourth_dose,
      trackData.fifth_dose,
    ].filter(Boolean).length;
    
    return (completedDoses / 5) * 100;
  };

  const getNextDoseNumber = (): number | null => {
    if (!trackData) return 1;
    
    if (!trackData.first_dose) return 1;
    if (!trackData.second_dose) return 2;
    if (!trackData.third_dose) return 3;
    if (!trackData.fourth_dose) return 4;
    if (!trackData.fifth_dose) return 5;
    
    return null; // All doses completed
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="TT Immunization" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading immunization status...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const completionPercentage = calculateCompletion();
  const nextDose = getNextDoseNumber();

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="TT Immunization" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <MaterialCommunityIcons name="account-heart" size={28} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Tetanus Toxoid Immunization</ThemedText>
          </View>
        </View>
      )}

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <ThemedText style={styles.progressLabel}>Immunization Progress</ThemedText>
          <ThemedText style={styles.progressText}>
            {Math.round(completionPercentage)}% Complete
          </ThemedText>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${completionPercentage}%`,
                backgroundColor:
                  completionPercentage === 100
                    ? theme.colors.success
                    : theme.colors.primary,
              },
            ]}
          />
        </View>
        
        {trackData?.fim_status && (
          <View style={styles.fimBadge}>
            <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
            <ThemedText style={styles.fimText}>Fully Immunized Mother (FIM)</ThemedText>
          </View>
        )}
      </View>

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
        {/* 📊 TABLE-STYLE IMMUNIZATION STATUS */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <MaterialCommunityIcons name="table" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.tableTitle}>TT Immunization Status</ThemedText>
          </View>

          {/* Table Header Row */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableHeaderCell, styles.doseColumn]}>
              <ThemedText style={styles.tableHeaderText}>Dose</ThemedText>
            </View>
            <View style={[styles.tableHeaderCell, styles.statusColumn]}>
              <ThemedText style={styles.tableHeaderText}>Status</ThemedText>
            </View>
            <View style={[styles.tableHeaderCell, styles.dateColumn]}>
              <ThemedText style={styles.tableHeaderText}>Date Given</ThemedText>
            </View>
          </View>

          {/* Table Data Rows */}
          {/* Row 1: First Dose */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.doseColumn]}>
              <ThemedText style={styles.doseText}>1st Dose</ThemedText>
            </View>
            <View style={[styles.tableCell, styles.statusColumn]}>
              {trackData?.first_dose ? (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              ) : (
                <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
              )}
            </View>
            <View style={[styles.tableCell, styles.dateColumn]}>
              <ThemedText style={styles.dateText}>
                {formatDate(trackData?.first_dose_date || null)}
              </ThemedText>
            </View>
          </View>

          {/* Row 2: Second Dose */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.doseColumn]}>
              <ThemedText style={styles.doseText}>2nd Dose</ThemedText>
            </View>
            <View style={[styles.tableCell, styles.statusColumn]}>
              {trackData?.second_dose ? (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              ) : (
                <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
              )}
            </View>
            <View style={[styles.tableCell, styles.dateColumn]}>
              <ThemedText style={styles.dateText}>
                {formatDate(trackData?.second_dose_date || null)}
              </ThemedText>
            </View>
          </View>

          {/* Row 3: Third Dose */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.doseColumn]}>
              <ThemedText style={styles.doseText}>3rd Dose</ThemedText>
            </View>
            <View style={[styles.tableCell, styles.statusColumn]}>
              {trackData?.third_dose ? (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              ) : (
                <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
              )}
            </View>
            <View style={[styles.tableCell, styles.dateColumn]}>
              <ThemedText style={styles.dateText}>
                {formatDate(trackData?.third_dose_date || null)}
              </ThemedText>
            </View>
          </View>

          {/* Row 4: Fourth Dose */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.doseColumn]}>
              <ThemedText style={styles.doseText}>4th Dose</ThemedText>
            </View>
            <View style={[styles.tableCell, styles.statusColumn]}>
              {trackData?.fourth_dose ? (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              ) : (
                <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
              )}
            </View>
            <View style={[styles.tableCell, styles.dateColumn]}>
              <ThemedText style={styles.dateText}>
                {formatDate(trackData?.fourth_dose_date || null)}
              </ThemedText>
            </View>
          </View>

          {/* Row 5: Fifth Dose */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.doseColumn]}>
              <ThemedText style={styles.doseText}>5th Dose</ThemedText>
            </View>
            <View style={[styles.tableCell, styles.statusColumn]}>
              {trackData?.fifth_dose ? (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              ) : (
                <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
              )}
            </View>
            <View style={[styles.tableCell, styles.dateColumn]}>
              <ThemedText style={styles.dateText}>
                {formatDate(trackData?.fifth_dose_date || null)}
              </ThemedText>
            </View>
          </View>

          {/* FIM Status Row */}
          <View style={[styles.tableRow, styles.fimRow]}>
            <View style={[styles.tableCell, styles.doseColumn]}>
              <ThemedText style={[styles.doseText, styles.fimLabel]}>FIM Status</ThemedText>
            </View>
            <View style={[styles.tableCell, styles.statusColumn]}>
              {trackData?.fim_status ? (
                <Ionicons name="shield-checkmark" size={28} color={theme.colors.success} />
              ) : (
                <Ionicons name="close-circle" size={28} color={theme.colors.danger} />
              )}
            </View>
            <View style={[styles.tableCell, styles.dateColumn]}>
              <ThemedText style={[styles.dateText, styles.fimStatusText]}>
                {trackData?.fim_status ? 'Complete' : 'Incomplete'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Next Dose Info */}
        {nextDose && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.infoText}>
              Next due: TT Dose {nextDose}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* FAB - Only show if not fully immunized */}
      {nextDose && (
        <Pressable style={styles.fab} onPress={handleAddDose}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      )}
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
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  },
  bannerInfo: {
    flex: 1,
  },
  maternalName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  bannerSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  fimBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  fimText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.success,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  
  // 📊 TABLE STYLES
  tableCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
  },
  tableHeaderCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
  },
  fimRow: {
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    borderBottomWidth: 0,
  },
  tableCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  doseColumn: {
    flex: 2,
  },
  statusColumn: {
    flex: 1,
  },
  dateColumn: {
    flex: 2,
  },
  doseText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  fimLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.warning,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  fimStatusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warningLight,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});