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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

// Clean, modern theme following iOS/Material Design principles
const theme = {
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#E1E4E8',
    borderLight: '#F0F2F5',
    primary: '#0066CC',
    primaryLight: '#E6F2FF',
    success: '#28A745',
    successLight: '#D4EDDA',
    warning: '#FFC107',
    warningLight: '#FFF3CD',
    danger: '#DC3545',
    info: '#17A2B8',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  radius: { sm: 6, md: 10, lg: 14 },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  }
};

interface GrowthRecord {
  date_of_visit: string;
  age_years: number;
  age_months: number;
  age_in_months: number;
  weight_kg: number;
  height_cm: number;
  temp_c: number;
  resp_rate: number;
  pulse_rate: number;
  notes?: string;
}

export default function ResidentGrowthMonitoringListScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    fetchGrowthRecords();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(tabs)/health/child/${child_health_id}` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [child_health_id])
  );

  const fetchGrowthRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_GROWTH_MONITORING_LIST}${child_health_id}/growth-monitoring/`
      );
      const data = await response.json();

      console.log('📊 Growth records response:', data);
      console.log('📊 First record:', data.data?.[0]);

      if (data.success) {
        data.data?.forEach((record: any, index: number) => {
          console.log(`Record ${index}:`, {
            age_years: record.age_years,
            age_months: record.age_months,
            age_in_months: record.age_in_months,
          });
        });

        setRecords(data.data || []);
        setChildName(data.child_name || 'Child');
      } else {
        Alert.alert('Error', data.error || 'Failed to load growth records');
      }
    } catch (error) {
      console.error('Failed to load growth records:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGrowthRecords();
  };

  const handleAddRecord = () => {
    router.push(`/(bhw)/child-health/${child_health_id}/growth-monitoring/add-growth-record` as any);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatAge = (ageInMonths: number): string => {
    if (ageInMonths === 0) return 'Newborn (0 months)';
    if (ageInMonths === 1) return '1 month';
    if (ageInMonths < 12) return `${ageInMonths} months`;
    
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    
    if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} (${ageInMonths} months)`;
    }
    return `${years}y ${months}m (${ageInMonths} months)`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Growth Monitoring" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading records...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Growth Monitoring" onBackPress={handleBackPress} />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="child-care" size={22} color={theme.colors.success} />
            <View>
              <ThemedText style={styles.childName}>{childName}</ThemedText>
              <ThemedText style={styles.recordCount}>
                {records.length} {records.length === 1 ? 'record' : 'records'}
              </ThemedText>
            </View>
          </View>
        </View>
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
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="show-chart" size={56} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Growth Records</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Track your child&apos;s growth by adding measurements
            </ThemedText>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddRecord}>
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.emptyButtonText}>Add First Record</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          records.map((record, index) => (
            <View
              key={`${record.date_of_visit}-${index}`}
              style={[styles.recordCard, index === records.length - 1 && styles.lastCard]}
            >
              {/* Record Number Badge */}
              <View style={styles.recordBadge}>
                <MaterialIcons name="assignment" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.recordBadgeText}>Record #{records.length - index}</ThemedText>
              </View>

              {/* Date Recorded */}
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Date Recorded</ThemedText>
                <View style={styles.valueContainer}>
                  {/* <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} /> */}
                  <ThemedText style={styles.value}>{formatDate(record.date_of_visit)}</ThemedText>
                </View>
              </View>

              {/* Time */}
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Time</ThemedText>
                <View style={styles.valueContainer}>
                  {/* <Ionicons name="time" size={16} color={theme.colors.textSecondary} /> */}
                  <ThemedText style={styles.value}>{formatTime(record.date_of_visit)}</ThemedText>
                </View>
              </View>

              {/* Age */}
              <View style={[styles.infoRow]}>
                <ThemedText style={styles.label}>Age</ThemedText>
                <View style={styles.valueContainer}>
                  {/* <MaterialIcons name="cake" size={16} color={theme.colors.primary} /> */}
                  <ThemedText style={[styles.value]}>{formatAge(record.age_in_months)}</ThemedText>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.sectionDivider} />

              {/* Weight */}
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Weight</ThemedText>
                <View style={styles.valueContainer}>
                  {/* <MaterialIcons name="monitor-weight" size={18} color={theme.colors.info} /> */}
                  <ThemedText style={styles.value}>{record.weight_kg} kg</ThemedText>
                </View>
              </View>

              {/* Height */}
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Height</ThemedText>
                <View style={styles.valueContainer}>
                  {/* <MaterialIcons name="height" size={18} color={theme.colors.success} /> */}
                  <ThemedText style={styles.value}>{record.height_cm} cm</ThemedText>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.sectionDivider} />

              {/* Temperature */}
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Temperature</ThemedText>
                <View style={styles.valueContainer}>
                  {/* <Ionicons name="thermometer" size={18} color={theme.colors.warning} /> */}
                  <ThemedText style={styles.value}>{record.temp_c} °C</ThemedText>
                </View>
              </View>

              {/* Respiratory Rate */}
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Respiratory Rate</ThemedText>
                <View style={styles.valueContainer}>
                  {/* <MaterialIcons name="air" size={18} color={theme.colors.info} /> */}
                  <ThemedText style={styles.value}>{record.resp_rate} bpm</ThemedText>
                </View>
              </View>

              {/* Pulse Rate */}
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Pulse Rate</ThemedText>
                <View style={styles.valueContainer}>
                  {/* <MaterialIcons name="favorite" size={18} color={theme.colors.danger} /> */}
                  <ThemedText style={styles.value}>{record.pulse_rate} bpm</ThemedText>
                </View>
              </View>

              {/* Notes */}
              {record.notes && (
                <>
                  <View style={styles.sectionDivider} />
                  <View style={styles.notesContainer}>
                    <ThemedText style={styles.label}>Notes</ThemedText>
                    <ThemedText style={styles.notesText}>{record.notes}</ThemedText>
                  </View>
                </>
              )}
            </View>
          ))
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
  headerCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    ...theme.shadow,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
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
  recordCount: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recordCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow,
  },
  lastCard: {
    marginBottom: 0,
  },
  recordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: 6,
    marginBottom: theme.spacing.lg,
  },
  recordBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  highlightRow: {
    backgroundColor: theme.colors.primaryLight,
    marginHorizontal: -theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  highlightValue: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  notesContainer: {
    gap: theme.spacing.sm,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    backgroundColor: theme.colors.borderLight,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});