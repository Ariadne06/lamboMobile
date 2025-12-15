import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

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
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface PregnancyOutcome {
  outcome_id: number;
  outcome_type: string;
  delivery_type: string;
  place_delivery_type: string;
  ownership_type: string | null;
  others_description: string | null;
  birth_attendant: string;
  other_attendant: string | null;
  time_of_delivery: string | null;
  date_terminated: string;
  baby_birthweight_in_grams: number | null;
  baby_sex: string | null;
  recorded_by: number;
  created_at: string;
}

export default function ResidentPregnancyOutcomeScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [outcome, setOutcome] = useState<PregnancyOutcome | null>(null);
  const [maternalName, setMaternalName] = useState('');
  const [recordStatus, setRecordStatus] = useState('');

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    router.push(`/(tabs)/health/maternal/${maternal_health_id}` as any);
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

      console.log('📋 Maternal detail response:', maternalData);

      if (maternalData.success) {
        setMaternalName(maternalData.data.full_name || '');
        setRecordStatus(maternalData.data.record_status || 'Ongoing');
      }

      // Fetch pregnancy outcome
      const outcomeResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_DELIVERY_OUTCOME_VIEW(parseInt(maternal_health_id))}`
      );
      const outcomeData = await outcomeResponse.json();

      console.log('✅ Pregnancy outcome response:', outcomeData);

      if (outcomeData.success && outcomeData.data) {
        setOutcome(outcomeData.data);
      } else {
        setOutcome(null);
      }
    } catch (error) {
      console.error('❌ Error loading pregnancy outcome:', error);
      Alert.alert('Error', 'Failed to load pregnancy outcome');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddOutcome = () => {
    console.log('🔍 Current record status:', recordStatus);
    
    const canAdd = !recordStatus || recordStatus.toLowerCase() === 'ongoing';
    
    if (!canAdd) {
      Alert.alert(
        'Cannot Add Outcome',
        `Pregnancy outcome can only be added for records with Ongoing status. Current status: ${recordStatus}`
      );
      return;
    }

    router.push(
      `/(bhw)/maternal-health/${maternal_health_id}/pregnancy-outcome/add-outcome` as any
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string | null): string => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getPlaceOfDeliveryDisplay = (): string => {
    if (!outcome) return 'N/A';
    
    if (outcome.place_delivery_type.toUpperCase() === 'OTHERS' && outcome.others_description) {
      return outcome.others_description;
    }
    
    return outcome.place_delivery_type;
  };

  const getBirthAttendantDisplay = (): string => {
    if (!outcome) return 'N/A';
    
    if (outcome.birth_attendant.toUpperCase() === 'OTHERS' && outcome.other_attendant) {
      return outcome.other_attendant;
    }
    
    return outcome.birth_attendant;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Pregnancy Outcome" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Pregnancy Outcome" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <MaterialCommunityIcons name="baby-carriage" size={28} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Pregnancy Outcome</ThemedText>
            {recordStatus && (
              <ThemedText style={styles.statusBadge}>{recordStatus}</ThemedText>
            )}
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !outcome && styles.scrollContentCentered
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {!outcome ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="baby-carriage" size={80} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Pregnancy Outcome Recorded</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Record the delivery outcome and details for this pregnancy.
            </ThemedText>

            {(!recordStatus || recordStatus.toLowerCase() === 'ongoing') && (
              <TouchableOpacity style={styles.addButton} onPress={handleAddOutcome}>
                <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                <ThemedText style={styles.addButtonText}>Add Pregnancy Outcome</ThemedText>
              </TouchableOpacity>
            )}

            {recordStatus && recordStatus.toLowerCase() !== 'ongoing' && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={theme.colors.info} />
                <ThemedText style={styles.infoText}>
                  Pregnancy outcome can only be added for records with Ongoing status
                </ThemedText>
              </View>
            )}
          </View>
        ) : (
          /* Display Outcome */
          <>
            {/* Outcome Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <ThemedText style={styles.cardTitle}>Outcome Details</ThemedText>
              </View>

              <InfoRow label="Outcome Type" value={outcome.outcome_type} />
              <InfoRow label="Delivery Type" value={outcome.delivery_type} />
              <InfoRow label="Date Terminated" value={formatDate(outcome.date_terminated)} />
              <InfoRow label="Time of Delivery" value={formatTime(outcome.time_of_delivery)} />
            </View>

            {/* Baby Information Card */}
            {(outcome.baby_birthweight_in_grams || outcome.baby_sex) && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="heart" size={20} color={theme.colors.primary} />
                  <ThemedText style={styles.cardTitle}>Baby Information</ThemedText>
                </View>

                {outcome.baby_birthweight_in_grams && (
                  <InfoRow 
                    label="Birthweight" 
                    value={`${outcome.baby_birthweight_in_grams} grams`} 
                  />
                )}
                {outcome.baby_sex && (
                  <InfoRow label="Sex" value={outcome.baby_sex} />
                )}
              </View>
            )}

            {/* Place of Delivery Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
                <ThemedText style={styles.cardTitle}>Place of Delivery</ThemedText>
              </View>

              <InfoRow label="Place of Delivery" value={getPlaceOfDeliveryDisplay()} />
              
              {outcome.place_delivery_type.toUpperCase() === 'HEALTH FACILITY' && outcome.ownership_type && (
                <InfoRow label="Facility Ownership" value={outcome.ownership_type} />
              )}
            </View>

            {/* Birth Attendant Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
                <ThemedText style={styles.cardTitle}>Birth Attendant</ThemedText>
              </View>

              <InfoRow label="Birth Attendant" value={getBirthAttendantDisplay()} />
            </View>

            {/* Record Info */}
            <View style={styles.recordInfo}>
              <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
              <ThemedText style={styles.recordInfoText}>
                Recorded on {formatDate(outcome.created_at)}
              </ThemedText>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) => (
  <View style={[styles.infoRow, multiline && styles.infoRowMultiline]}>
    <ThemedText style={styles.infoLabel}>{label}:</ThemedText>
    <ThemedText style={[styles.infoValue, multiline && styles.infoValueMultiline]}>
      {value || 'N/A'}
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
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.success,
    marginTop: 4,
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
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
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
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
  infoValueMultiline: {
    textAlign: 'left',
    marginTop: theme.spacing.xs,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md,
  },
  recordInfoText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
});