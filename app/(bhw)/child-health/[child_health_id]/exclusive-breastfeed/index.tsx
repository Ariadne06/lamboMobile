import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
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

export default function ExclusiveBreastfeedScreen() {
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
    router.push(`/(bhw)/child-health/${child_health_id}` as any);
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
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_EXCLUSIVE_BREASTFEED_LIST(parseInt(child_health_id))}`
      );
      const data = await response.json();

      console.log('🍼 Exclusive breastfeed response:', data);

      if (data.success) {
        setMonths(data.data || []);
        setChildName(data.child_name || '');
        setFeedingMethod(data.feeding_method || '');
      } else {
        Alert.alert('Error', data.error || 'Failed to load tracking data');
      }
    } catch (error) {
      console.error('Failed to load exclusive breastfeed tracking:', error);
      Alert.alert('Error', 'Failed to load tracking data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTracking();
  };

  const handleAddAssessment = () => {
    // Check if feeding method is breastfeeding
    if (feedingMethod.toLowerCase() !== 'breastfeeding') {
      Alert.alert(
        'Not Applicable',
        'Exclusive breastfeeding tracking is only for breastfeeding infants.',
        [{ text: 'OK' }]
      );
      return;
    }

    router.push(`/(bhw)/child-health/${child_health_id}/exclusive-breastfeed/add-assessment` as any);
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

  const getNextMonth = (): string | null => {
    const assessedMonths = months.filter(m => m.date_assessed !== null);
    if (assessedMonths.length === 6) return null; // All complete
    
    const lastAssessed = assessedMonths.length;
    const nextMonth = months.find(m => m.month_number === lastAssessed + 1);
    return nextMonth ? nextMonth.month_sequence_name : null;
  };

  const assessedCount = months.filter(m => m.date_assessed !== null).length;
  const totalMonths = 6;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Exclusive Breastfeeding" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.breastfeed} />
          <ThemedText style={styles.loadingText}>Loading tracking data...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const nextMonth = getNextMonth();
  const isComplete = assessedCount === totalMonths;
  const isBreastfeeding = feedingMethod.toLowerCase() === 'breastfeeding';

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Exclusive Breastfeeding" onBackPress={handleBackPress} />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="child-care" size={22} color={theme.colors.breastfeed} />
            <View>
              <ThemedText style={styles.childName}>{childName}</ThemedText>
              <ThemedText style={styles.feedingMethod}>
                Feeding: {feedingMethod}
              </ThemedText>
            </View>
          </View>
          {isBreastfeeding && !isComplete && (
            <TouchableOpacity style={styles.addIconButton} onPress={handleAddAssessment}>
              <Ionicons name="add" size={24} color={theme.colors.breastfeed} />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressLabel}>Progress</ThemedText>
            <ThemedText style={styles.progressText}>
              {assessedCount} of {totalMonths} months
            </ThemedText>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(assessedCount / totalMonths) * 100}%`,
                  backgroundColor: theme.colors.breastfeed,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Info Notice */}
      {!isBreastfeeding && (
        <View style={styles.warningNotice}>
          <Ionicons name="information-circle" size={20} color={theme.colors.textSecondary} />
          <ThemedText style={styles.warningText}>
            Exclusive breastfeeding tracking is only applicable for breastfeeding infants.
          </ThemedText>
        </View>
      )}

      {isBreastfeeding && nextMonth && (
        <View style={styles.nextMonthCard}>
            <View style={styles.nextMonthHeader}>
            <MaterialIcons name="event-available" size={24} color={theme.colors.breastfeed} />
            <View style={styles.nextMonthInfo}>
                <ThemedText style={styles.nextMonthLabel}>Ready to Assess</ThemedText>
                <ThemedText style={styles.nextMonthValue}>{nextMonth}</ThemedText>
            </View>
            </View>
            <TouchableOpacity 
            style={styles.quickAddButton}
            onPress={handleAddAssessment}
            >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.quickAddText}>Add Now</ThemedText>
            </TouchableOpacity>
        </View>
        )}

      {isComplete && (
        <View style={styles.successNotice}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <ThemedText style={styles.successText}>
            All 6 months of exclusive breastfeeding tracked! 🎉
          </ThemedText>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.monthsGrid}>
          {months.map((month) => {
            const isAssessed = month.date_assessed !== null;
            
            return (
              <View
                key={month.month_id}
                style={[
                  styles.monthCard,
                  isAssessed ? styles.monthCardAssessed : styles.monthCardPending,
                ]}
              >
                <View style={styles.monthHeader}>
                  <Ionicons
                    name={isAssessed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={isAssessed ? theme.colors.success : theme.colors.pending}
                  />
                  <ThemedText
                    style={[
                      styles.monthNumber,
                      { color: isAssessed ? theme.colors.success : theme.colors.textMuted },
                    ]}
                  >
                    {month.month_number}
                  </ThemedText>
                </View>

                <ThemedText style={styles.monthName}>{month.month_sequence_name}</ThemedText>

                {isAssessed ? (
                  <>
                    <View style={styles.statusBadge}>
                      <ThemedText style={styles.statusText}>Assessed</ThemedText>
                    </View>
                    <ThemedText style={styles.dateText}>{formatDate(month.date_assessed)}</ThemedText>
                  </>
                ) : (
                  <View style={[styles.statusBadge, styles.statusBadgePending]}>
                    <ThemedText style={styles.statusTextPending}>Pending</ThemedText>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* FAB - Only show if breastfeeding and not complete */}
      {/* {isBreastfeeding && !isComplete && (
        <TouchableOpacity style={styles.fab} onPress={handleAddAssessment} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )} */}
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
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.breastfeedLight,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: theme.colors.breastfeedLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.breastfeed,
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
  infoTextBold: {
    fontWeight: '700',
    color: theme.colors.breastfeed,
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
    paddingBottom: 100,
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
//   fab: {
//     position: 'absolute',
//     right: 20,
//     bottom: 20,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: theme.colors.breastfeed,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 6,
//   },
  nextMonthCard: {
  backgroundColor: theme.colors.breastfeedLight,
  marginHorizontal: theme.spacing.lg,
  marginBottom: theme.spacing.md,
  borderRadius: theme.radius.lg,
  padding: theme.spacing.lg,
  borderWidth: 2,
  borderColor: theme.colors.breastfeed,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
nextMonthHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  flex: 1,
},
nextMonthInfo: {
  flex: 1,
},
nextMonthLabel: {
  fontSize: 12,
  color: theme.colors.textSecondary,
  fontWeight: '600',
  textTransform: 'uppercase',
},
nextMonthValue: {
  fontSize: 18,
  color: theme.colors.breastfeed,
  fontWeight: '700',
  marginTop: 2,
},
quickAddButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.breastfeed,
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.md,
  borderRadius: theme.radius.lg,
  gap: theme.spacing.xs,
},
quickAddText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},
});