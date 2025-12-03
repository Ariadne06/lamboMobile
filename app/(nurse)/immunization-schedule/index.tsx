import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
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
    primary: '#EC4899',
    primaryLight: '#FDF2F8',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface ImmunizationSchedule {
  schedule_id: number;
  child_health_id: number;
  child_full_name: string;
  family_code: string | null;
  vaccine_type_id: number;
  vaccine_name: string;
  next_dose_type_id: number;
  next_dose_name: string;
  scheduled_date: string;
  days_until_due: number;
}

export default function ImmunizationScheduleScreen() {
  const router = useRouter();

  const [schedules, setSchedules] = useState<ImmunizationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchSchedules(true);
  }, [searchQuery]);

  const handleBackPress = () => {
    router.push('/(nurse)/menu');
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

  const fetchSchedules = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true);
          setOffset(0);
        }

        const effectiveOffset = reset ? 0 : offset;
        const params = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          offset: effectiveOffset.toString(),
        });

        if (searchQuery.trim()) {
          params.append('q', searchQuery.trim());
        }

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATION_SCHEDULE}?${params.toString()}`
        );

        const data = await response.json();

        if (data.success) {
          const newSchedules = reset ? data.data : [...schedules, ...data.data];
          setSchedules(newSchedules);
          setHasMore(data.data.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error('❌ Failed to load immunization schedule:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, offset, schedules]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSchedules(true);
  };

  const loadMore = () => {
    if (!hasMore) return;
    setOffset((prev) => prev + PAGE_SIZE);
    fetchSchedules();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilColor = (days: number) => {
    if (days < 0) return theme.colors.danger;
    if (days <= 7) return theme.colors.warning;
    return theme.colors.success;
  };

  const getDaysUntilBgColor = (days: number) => {
    if (days < 0) return theme.colors.dangerLight;
    if (days <= 7) return theme.colors.warningLight;
    return theme.colors.successLight;
  };

  const getDaysUntilText = (days: number): string => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Immunization Schedule" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading schedule...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Immunization Schedule" onBackPress={handleBackPress} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by child name, family code, or vaccine..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textMuted}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{schedules.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.colors.danger }]}>
            {schedules.filter((s) => s.days_until_due < 0).length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Overdue</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.colors.warning }]}>
            {schedules.filter((s) => s.days_until_due >= 0 && s.days_until_due <= 7).length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Due Soon</ThemedText>
        </View>
      </View>

      {/* Schedule List */}
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
        {schedules.map((schedule, index) => (
          <TouchableOpacity
            key={schedule.schedule_id}
            style={[styles.card, index === schedules.length - 1 && styles.lastCard]}
            onPress={() => router.push(`/(nurse)/child-health/${schedule.child_health_id}` as any)}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.childInfo}>
                <View style={styles.avatarContainer}>
                  <MaterialIcons name="child-care" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.childDetails}>
                  <ThemedText style={styles.childName} numberOfLines={1}>
                    {schedule.child_full_name}
                  </ThemedText>
                  {schedule.family_code && (
                    <ThemedText style={styles.familyCode}>{schedule.family_code}</ThemedText>
                  )}
                </View>
              </View>

              {/* Days Until Badge */}
              <View
                style={[
                  styles.daysUntilBadge,
                  { backgroundColor: getDaysUntilBgColor(schedule.days_until_due) },
                ]}
              >
                <Ionicons
                  name={
                    schedule.days_until_due < 0
                      ? 'warning'
                      : schedule.days_until_due <= 7
                      ? 'time'
                      : 'checkmark-circle'
                  }
                  size={14}
                  color={getDaysUntilColor(schedule.days_until_due)}
                />
                <ThemedText
                  style={[styles.daysUntilText, { color: getDaysUntilColor(schedule.days_until_due) }]}
                >
                  {getDaysUntilText(schedule.days_until_due)}
                </ThemedText>
              </View>
            </View>

            {/* Vaccine Info */}
            <View style={styles.vaccineInfo}>
              <View style={styles.vaccineRow}>
                <MaterialIcons name="vaccines" size={18} color={theme.colors.info} />
                <ThemedText style={styles.vaccineName}>{schedule.vaccine_name}</ThemedText>
              </View>
              <View style={styles.doseRow}>
                <Ionicons name="medical" size={16} color={theme.colors.textSecondary} />
                <ThemedText style={styles.doseText}>{schedule.next_dose_name}</ThemedText>
              </View>
              <View style={styles.dateRow}>
                <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                <ThemedText style={styles.dateText}>{formatDate(schedule.scheduled_date)}</ThemedText>
              </View>
            </View>

            {/* Arrow */}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textMuted}
              style={styles.arrow}
            />
          </TouchableOpacity>
        ))}

        {hasMore && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
            <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
          </TouchableOpacity>
        )}

        {schedules.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-available" size={64} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Scheduled Immunizations</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              There are no upcoming immunization schedules at this time.
            </ThemedText>
          </View>
        )}
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
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  familyCode: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  daysUntilBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: 4,
  },
  daysUntilText: {
    fontSize: 11,
    fontWeight: '600',
  },
  vaccineInfo: {
    gap: theme.spacing.sm,
  },
  vaccineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  vaccineName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.info,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  doseText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  arrow: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: '50%',
  },
  loadMoreBtn: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});