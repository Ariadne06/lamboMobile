import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  BackHandler,
  Alert,
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
  recorded_by: number;
  created_at: string;
}

export default function NursePregnancyOutcomeScreen() {
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
    router.push(`/(nurse)/maternal-health/${maternal_health_id}`);
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

      const maternalResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const maternalData = await maternalResponse.json();

      if (maternalData.success) {
        setMaternalName(maternalData.data.full_name || '');
        setRecordStatus(maternalData.data.record_status || 'Ongoing');
      }

      const outcomeResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_DELIVERY_OUTCOME_VIEW(parseInt(maternal_health_id))}`
      );
      const outcomeData = await outcomeResponse.json();

      if (outcomeData.success && outcomeData.data) {
        setOutcome(outcomeData.data);
      } else {
        setOutcome(null);
      }
    } catch (error) {
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
    if (outcome.place_delivery_type.toUpperCase() === 'OTHERS' && outcome.others_description)
      return outcome.others_description;

    return outcome.place_delivery_type;
  };

  const getBirthAttendantDisplay = (): string => {
    if (!outcome) return 'N/A';
    if (outcome.birth_attendant.toUpperCase() === 'OTHERS' && outcome.other_attendant)
      return outcome.other_attendant;

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
            <ThemedText style={styles.statusBadge}>{recordStatus}</ThemedText>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {!outcome ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="baby-carriage" size={80} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Pregnancy Outcome Recorded</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              The midwife will record the delivery outcome once available.
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Outcome Details */}
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

            {/* Place of Delivery */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
                <ThemedText style={styles.cardTitle}>Place of Delivery</ThemedText>
              </View>

              <InfoRow label="Place of Delivery" value={getPlaceOfDeliveryDisplay()} />

              {outcome.place_delivery_type.toUpperCase() === 'HEALTH FACILITY' &&
                outcome.ownership_type && (
                  <InfoRow label="Facility Ownership" value={outcome.ownership_type} />
                )}
            </View>

            {/* Birth Attendant */}
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md,
  },
  loadingText: { fontSize: 14, color: theme.colors.textSecondary },

  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  bannerInfo: { flex: 1 },
  maternalName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
  bannerSubtext: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: {
    marginTop: 4,
    backgroundColor: theme.colors.successLight,
    color: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg },
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
  infoRowMultiline: { flexDirection: 'column', alignItems: 'flex-start' },
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
  infoValueMultiline: { textAlign: 'left', marginTop: theme.spacing.xs },

  recordInfo: {
    flexDirection: 'row',
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
