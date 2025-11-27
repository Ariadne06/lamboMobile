import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
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
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#10B981',
    successLight: '#ECFDF5',
    pending: '#9CA3AF',
    pendingLight: '#F3F4F6',
    breastfeed: '#EC4899',
    breastfeedLight: '#FDF2F8',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface MonthTrack {
  month_id: number;
  month_number: number;
  month_sequence_name: string;
  date_assessed: string | null;
}

export default function NurseExclusiveBreastfeedScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [months, setMonths] = useState<MonthTrack[]>([]);
  const [childName, setChildName] = useState('');
  const [feedingMethod, setFeedingMethod] = useState('');

  useEffect(() => {
    fetchTracking();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(nurse)/child-health/${child_health_id}` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTracking();
      
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [child_health_id])
  );

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}${API_ENDPOINTS.CHILD_EXCLUSIVE_BREASTFEED_LIST(parseInt(child_health_id))}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setChildName(data.child_name || '');
        setFeedingMethod(data.feeding_method || '');
        setMonths(data.data || []);
      }
    } catch (error) {
      console.error('❌ Failed to load breastfeed tracking:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTracking();
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

  const assessedCount = months.filter(m => m.date_assessed !== null).length;
  const totalMonths = 6;
  const isComplete = assessedCount === totalMonths;
  const isBreastfeeding = feedingMethod.toLowerCase() === 'breastfeeding';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Exclusive Breastfeed" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.breastfeed} />
          <ThemedText style={styles.loadingText}>Loading breastfeed tracking...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Exclusive Breastfeed" onBackPress={handleBackPress} />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="heart" size={24} color={theme.colors.breastfeed} />
            <View style={styles.childInfo}>
              <ThemedText style={styles.childName}>{childName}</ThemedText>
              <ThemedText style={styles.feedingMethod}>{feedingMethod}</ThemedText>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressLabel}>Assessment Progress</ThemedText>
            <ThemedText style={styles.progressText}>{assessedCount} / {totalMonths}</ThemedText>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${(assessedCount / totalMonths) * 100}%`,
                  backgroundColor: isComplete ? theme.colors.success : theme.colors.breastfeed 
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Info Notice - VIEW ONLY */}
      <View style={styles.infoNotice}>
        <Ionicons name="information-circle" size={16} color={theme.colors.primary} />
        <ThemedText style={styles.infoText}>
          You can view the breastfeeding assessment progress tracked by the BHW.
        </ThemedText>
      </View>

      {/* Status Notice */}
      {isComplete ? (
        <View style={styles.successNotice}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <ThemedText style={styles.successText}>
            All 6 months assessed! Exclusive breastfeeding tracking complete.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.warningNotice}>
          <Ionicons name="alert-circle" size={16} color={theme.colors.textMuted} />
          <ThemedText style={styles.warningText}>
            {assessedCount === 0 
              ? 'No assessments recorded yet. BHW will track this.'
              : `${totalMonths - assessedCount} month(s) remaining to be assessed by BHW.`}
          </ThemedText>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.breastfeed]} />
        }
      >
        {/* Months Grid */}
        <View style={styles.monthsGrid}>
          {months.map((month) => {
            const isAssessed = month.date_assessed !== null;
            
            return (
              <View 
                key={month.month_id} 
                style={[
                  styles.monthCard,
                  isAssessed ? styles.monthCardAssessed : styles.monthCardPending
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.monthHeader}>
                    <ThemedText style={[
                      styles.monthNumber,
                      { color: isAssessed ? theme.colors.success : theme.colors.pending }
                    ]}>
                      {month.month_number}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.monthName}>{month.month_sequence_name}</ThemedText>
                  
                  <View style={[
                    styles.statusBadge,
                    isAssessed ? {} : styles.statusBadgePending
                  ]}>
                    <ThemedText style={isAssessed ? styles.statusText : styles.statusTextPending}>
                      {isAssessed ? 'Assessed' : 'Pending'}
                    </ThemedText>
                  </View>

                  {isAssessed && (
                    <ThemedText style={styles.dateText}>
                      {formatDate(month.date_assessed)}
                    </ThemedText>
                  )}
                </View>
              </View>
            );
          })}
        </View>
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
  headerCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  feedingMethod: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  progressSection: {
    gap: theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: theme.colors.pendingLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  warningNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.pendingLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.textMuted,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  successNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.success,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  monthCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    alignItems: 'center',
  },
  monthCardAssessed: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successLight,
  },
  monthCardPending: {
    borderColor: theme.colors.border,
  },
  cardHeader: {
    width: '100%',
    alignItems: 'center',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  monthNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  monthName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  statusBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
  },
  statusBadgePending: {
    backgroundColor: theme.colors.pending,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusTextPending: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});