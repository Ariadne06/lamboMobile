import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#E11D2F', // red-ish like your header
    primaryLight: '#FFE4E6',
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    chipBg: '#F3F4F6',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 },
};

interface ImmunizationRecord {
  vaccine_type_id: number;
  vaccine_name: string;
  at_birth_given: boolean;
  first_dose_given: boolean;
  second_dose_given: boolean;
  third_dose_given: boolean;
  last_administered: string | null;
  next_recommended_date: string | null;
  is_delayed: boolean;
}

type StatusInfo = {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  shieldColor: string;
  cardBg: string;
  cardBorder: string;
};

export default function NurseImmunizationListScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    fetchImmunizations();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(nurse)/child-health/${child_health_id}` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchImmunizations();

      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [child_health_id])
  );

  const fetchImmunizations = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_LIST(
        parseInt(child_health_id as string, 10)
      )}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setChildName(data.child_name || '');
        setRecords(data.data || []);
      }
    } catch (error) {
      console.error('❌ Failed to load immunizations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchImmunizations();
  };

  const handleAddImmunization = () => {
    router.push(`/(nurse)/child-health/${child_health_id}/immunization/add-immunization` as any);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US'); // MM/DD/YYYY style
  };

  const renderDoseChip = (
    label: string,
    given: boolean,
    disabled: boolean = false
  ) => {
    return (
      <View
        style={[
          styles.doseChip,
          given && styles.doseChipGiven,
          disabled && styles.doseChipDisabled,
        ]}
      >
        <View style={styles.doseChipIconCircle}>
          <Ionicons
            name={given ? 'checkmark' : 'ellipse-outline'}
            size={14}
            color={
              disabled
                ? theme.colors.textMuted
                : given
                ? theme.colors.success
                : theme.colors.textMuted
            }
          />
        </View>
        <ThemedText
          style={[
            styles.doseChipText,
            given && styles.doseChipTextGiven,
            disabled && styles.doseChipTextDisabled,
          ]}
        >
          {label}
        </ThemedText>
      </View>
    );
  };

  const getStatusInfo = (record: ImmunizationRecord): StatusInfo => {
    const anyGiven =
      record.at_birth_given ||
      record.first_dose_given ||
      record.second_dose_given ||
      record.third_dose_given;

    // Not started
    if (!anyGiven) {
      return {
        label: 'Not started',
        color: theme.colors.textMuted,
        bgColor: '#E5E7EB',
        icon: 'ellipse',
        shieldColor: theme.colors.textMuted,
        cardBg: theme.colors.surface,
        cardBorder: theme.colors.border,
      };
    }

    // Delayed
    if (record.is_delayed) {
      return {
        label: 'Delayed',
        color: theme.colors.danger,
        bgColor: theme.colors.dangerLight,
        icon: 'alert',
        shieldColor: theme.colors.warning,
        cardBg: theme.colors.warningLight,
        cardBorder: theme.colors.warning,
      };
    }

    // Complete (has doses and no next due)
    if (!record.next_recommended_date) {
      return {
        label: 'Complete',
        color: theme.colors.success,
        bgColor: theme.colors.successLight,
        icon: 'checkmark-circle',
        shieldColor: theme.colors.success,
        cardBg: theme.colors.surface,
        cardBorder: theme.colors.success,
      };
    }

    // In progress
    return {
      label: 'In progress',
      color: theme.colors.primary,
      bgColor: theme.colors.primaryLight,
      icon: 'time',
      shieldColor: theme.colors.primary,
      cardBg: theme.colors.surface,
      cardBorder: theme.colors.border,
    };
  };

  const renderRecordCard = (record: ImmunizationRecord, index: number) => {
    const lowerName = record.vaccine_name.toLowerCase();
    const isBCG = lowerName.includes('bcg');
    const isHepaB =
      lowerName.includes('hepa') ||
      lowerName.includes('hepatitis b') ||
      lowerName.includes('hep b');
    const isAtBirthOnly = isBCG || isHepaB;
    const isPenta = lowerName.includes('pentavalent') || lowerName.includes('penta');

    const status = getStatusInfo(record);
    const dosesGivenCount = [
      record.at_birth_given,
      record.first_dose_given,
      record.second_dose_given,
      record.third_dose_given,
    ].filter(Boolean).length;

    return (
      <View
        key={record.vaccine_type_id}
        style={[
          styles.card,
          {
            backgroundColor: status.cardBg,
            borderColor: status.cardBorder,
          },
          index === records.length - 1 && styles.lastCard,
        ]}
      >
        {/* Header: vaccine name + status pill + shield */}
        <View style={styles.cardHeader}>
          <View style={styles.vaccineTitleContainer}>
            <ThemedText style={styles.vaccineName}>{record.vaccine_name}</ThemedText>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: status.bgColor },
                ]}
              >
                <Ionicons name={status.icon as any} size={12} color={status.color} />
                <ThemedText
                  style={[styles.statusText, { color: status.color }]}
                >
                  {status.label}
                </ThemedText>
              </View>

              <ThemedText style={styles.doseSummaryText}>
                {dosesGivenCount === 0
                  ? 'No doses given yet'
                  : `${dosesGivenCount} dose${dosesGivenCount === 1 ? '' : 's'} given`}
              </ThemedText>
            </View>
          </View>

          <View style={styles.shieldBadge}>
            <Ionicons name="shield" size={18} color={status.shieldColor} />
          </View>
        </View>

        {/* Dose chips row */}
        <View style={styles.doseChipRow}>
          {/* At birth */}
          {renderDoseChip(
            'At birth',
            record.at_birth_given,
            isPenta // Pentavalent: at birth not applicable
          )}

          {/* 1st dose */}
          {renderDoseChip(
            '1st dose',
            record.first_dose_given,
            isAtBirthOnly // BCG & Hepa B: only at birth
          )}

          {/* 2nd dose */}
          {renderDoseChip(
            '2nd dose',
            record.second_dose_given,
            isAtBirthOnly
          )}

          {/* 3rd dose */}
          {renderDoseChip(
            '3rd dose',
            record.third_dose_given,
            isAtBirthOnly
          )}
        </View>

        {/* Dates row */}
        <View style={styles.dateRowWrapper}>
          <View style={styles.dateColumn}>
            <ThemedText style={styles.dateLabel}>Last given</ThemedText>
            <ThemedText style={styles.dateValue}>
              {formatDate(record.last_administered)}
            </ThemedText>
          </View>
          <View style={styles.dateColumn}>
            <ThemedText style={styles.dateLabel}>Next due</ThemedText>
            <ThemedText
              style={[
                styles.dateValue,
                record.next_recommended_date && record.is_delayed && {
                  color: theme.colors.danger,
                },
              ]}
            >
              {formatDate(record.next_recommended_date)}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Child Immunization" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>
            Loading immunization records...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Child Immunization" onBackPress={handleBackPress} />

      {/* Child name under header */}
      {childName && (
        <View style={styles.childHeaderRow}>
          <ThemedText style={styles.childHeaderName}>{childName}</ThemedText>
          <ThemedText style={styles.childHeaderSub}>
            {records.length} vaccines tracked
          </ThemedText>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyText}>No immunization records yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Start tracking vaccines by adding the first dose.
            </ThemedText>
          </View>
        ) : (
          records.map(renderRecordCard)
        )}
      </ScrollView>

      {/* Floating + button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddImmunization}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  childHeaderRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  childHeaderName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  childHeaderSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
    paddingTop: theme.spacing.sm,
  },
  card: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  vaccineTitleContainer: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  doseSummaryText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  shieldBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFFAA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doseChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  doseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.chipBg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  doseChipGiven: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  doseChipDisabled: {
    opacity: 0.4,
  },
  doseChipIconCircle: {
    marginRight: theme.spacing.xs,
  },
  doseChipText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  doseChipTextGiven: {
    color: theme.colors.success,
  },
  doseChipTextDisabled: {
    color: theme.colors.textMuted,
  },
  dateRowWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  dateColumn: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
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
