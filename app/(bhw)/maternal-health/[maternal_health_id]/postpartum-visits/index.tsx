import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  BackHandler,
  TouchableOpacity,
  Alert,
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
    primary: '#EC4899',
    primaryLight: '#FDF2F8',
    success: '#10B981',
    successLight: '#ECFDF5',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface PostpartumVisit {
  postpartum_id: number;
  date_of_visit: string;
  weight_kg: number | null;
  height_cm: number | null;
  blood_pressure: string | null;
  notes: string | null;
  laboratory_notes: string | null;
  recorded_by: number;
  created_at: string;
}

export default function PostpartumVisitsScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visits, setVisits] = useState<PostpartumVisit[]>([]);
  const [maternalName, setMaternalName] = useState('');
  const [recordStatus, setRecordStatus] = useState('');
  const [hasPregnancyOutcome, setHasPregnancyOutcome] = useState(false); // ✅ NEW

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();

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
        setRecordStatus(maternalData.data.record_status || '');
      }

      // ✅ CHECK if pregnancy outcome exists
      const outcomeResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_DELIVERY_OUTCOME_VIEW(parseInt(maternal_health_id))}`
      );
      const outcomeData = await outcomeResponse.json();

      console.log('🤰 Pregnancy outcome check:', outcomeData);

      // ✅ Set flag based on whether outcome exists
      if (outcomeData.success && outcomeData.data) {
        setHasPregnancyOutcome(true);
        console.log('✅ Has pregnancy outcome - button will show');
      } else {
        setHasPregnancyOutcome(false);
        console.log('❌ No pregnancy outcome - button will NOT show');
      }

      // Fetch postpartum visits
      const visitsResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_POSTPARTUM_LIST(parseInt(maternal_health_id))}`
      );
      const visitsData = await visitsResponse.json();

      console.log('✅ Postpartum visits response:', visitsData);

      if (visitsData.success) {
        setVisits(visitsData.data || []);
      } else {
        Alert.alert('Error', visitsData.error || 'Failed to load postpartum visits');
      }
    } catch (error) {
      console.error('❌ Error loading postpartum visits:', error);
      Alert.alert('Error', 'Failed to load postpartum visits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddVisit = () => {
    // ✅ Check if pregnancy outcome exists
    if (!hasPregnancyOutcome) {
      Alert.alert(
        'Cannot Add Visit',
        'Postpartum visits can only be added after pregnancy outcome is recorded.',
        [{ text: 'OK' }]
      );
      return;
    }

    router.push(`/(bhw)/maternal-health/${maternal_health_id}/postpartum-visits/add-postpartum` as any);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Postpartum Visits" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Postpartum Visits" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <MaterialCommunityIcons name="account-heart" size={28} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Postpartum Care Visits</ThemedText>
            {recordStatus && (
              <View style={[styles.statusBadge, recordStatus.toLowerCase() === 'completed' && styles.statusBadgeCompleted]}>
                <ThemedText style={styles.statusText}>{recordStatus}</ThemedText>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
          <View style={styles.summaryInfo}>
            <ThemedText style={styles.summaryValue}>{visits.length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Visits</ThemedText>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.info} />
          <View style={styles.summaryInfo}>
            <ThemedText style={styles.summaryValue}>
              {visits.length > 0 ? formatDate(visits[0].date_of_visit).split(',')[0] : 'N/A'}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Last Visit</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, visits.length === 0 && styles.scrollContentCentered]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {visits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-clock" size={80} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Postpartum Visits</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Record postpartum care visits after delivery to monitor mother&apos;s recovery.
            </ThemedText>

            {/*  Show button ONLY if pregnancy outcome exists */}
            {hasPregnancyOutcome ? (
              <TouchableOpacity style={styles.addButton} onPress={handleAddVisit} activeOpacity={0.7}>
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <ThemedText style={styles.addButtonText}>Add First Visit</ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={theme.colors.info} />
                <ThemedText style={styles.infoText}>
                  Postpartum visits can be added after pregnancy outcome is recorded
                </ThemedText>
              </View>
            )}
          </View>
        ) : (
          <>
            {visits.map((visit, index) => (
              <View key={visit.postpartum_id} style={[styles.card, index === visits.length - 1 && styles.lastCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.visitBadge}>
                    <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.primary} />
                    <ThemedText style={styles.visitBadgeText}>Visit #{visits.length - index}</ThemedText>
                  </View>
                  <ThemedText style={styles.visitDate}>{formatDate(visit.date_of_visit)}</ThemedText>
                </View>

                <View style={styles.cardBody}>
                  <InfoRow label="Weight" value={visit.weight_kg ? `${visit.weight_kg} kg` : 'N/A'} />
                  <InfoRow label="Height" value={visit.height_cm ? `${visit.height_cm} cm` : 'N/A'} />
                  <InfoRow label="Blood Pressure" value={visit.blood_pressure || 'N/A'} />

                  {visit.laboratory_notes && (
                    <View style={styles.notesSection}>
                      <View style={styles.notesSectionHeader}>
                        <Ionicons name="flask" size={16} color={theme.colors.info} />
                        <ThemedText style={styles.notesLabel}>Laboratory Result</ThemedText>
                      </View>
                      <ThemedText style={styles.notesText}>{visit.laboratory_notes}</ThemedText>
                    </View>
                  )}

                  {visit.notes && (
                    <View style={styles.notesSection}>
                      <View style={styles.notesSectionHeader}>
                        <Ionicons name="document-text" size={16} color={theme.colors.success} />
                        <ThemedText style={styles.notesLabel}>Notes</ThemedText>
                      </View>
                      <ThemedText style={styles.notesText}>{visit.notes}</ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.recordInfo}>
                  <Ionicons name="time" size={12} color={theme.colors.textMuted} />
                  <ThemedText style={styles.recordInfoText}>
                    Recorded on {formatDate(visit.created_at)}
                  </ThemedText>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* ✅ FAB - Show ONLY if pregnancy outcome exists */}
      {hasPregnancyOutcome && (
        <TouchableOpacity style={styles.fab} onPress={handleAddVisit} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <ThemedText style={styles.infoLabel}>{label}:</ThemedText>
    <ThemedText style={styles.infoValue}>{value}</ThemedText>
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
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.xs,
  },
  statusBadgeCompleted: {
    backgroundColor: theme.colors.successLight,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.success,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: theme.spacing.xl,
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
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.info,
    lineHeight: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  visitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
  },
  visitBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  visitDate: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  cardBody: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  notesSection: {
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.success,
  },
  notesText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  recordInfoText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
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