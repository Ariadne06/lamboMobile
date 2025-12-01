import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  BackHandler,
  Alert,
  TouchableOpacity,
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
    borderDark: '#D1D5DB',
    primary: '#8B5CF6',
    primaryLight: '#F3E8FF',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface CheckupRecord {
  checkup_id: number;
  trimester_name: string;
  date_of_checkup: string;
  aog_weeks: number;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  blood_pressure: string | null;
  fetal_heart_rate: number | null;
  laboratory_results: string | null;
  notes: string | null;
  date_of_visit: string;
}

type TrimesterSection = {
  name: string;
  range: string;
  minWeeks: number;
  maxWeeks: number;
  icon: string;
  color: string;
};

export default function CheckupsScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<CheckupRecord[]>([]);
  const [maternalName, setMaternalName] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({});

  const trimesters: TrimesterSection[] = [
    {
      name: 'First Trimester',
      range: '0-12 weeks',
      minWeeks: 0,
      maxWeeks: 12,
      icon: 'calendar-outline',
      color: theme.colors.info,
    },
    {
      name: 'Second Trimester',
      range: '13-28 weeks',
      minWeeks: 13,
      maxWeeks: 28,
      icon: 'calendar',
      color: theme.colors.success,
    },
    {
      name: 'Third Trimester',
      range: '29-42 weeks',
      minWeeks: 29,
      maxWeeks: 42,
      icon: 'calendar-sharp',
      color: theme.colors.warning,
    },
  ];

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
      }

      // Fetch checkup records
      const recordsResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHECKUP_LIST(parseInt(maternal_health_id))}`
      );
      const recordsData = await recordsResponse.json();

      console.log('✅ Checkup response:', recordsData);

      if (recordsData.success) {
        setRecords(recordsData.data || []);
      }
    } catch (error) {
      console.error('❌ Error loading checkups:', error);
      Alert.alert('Error', 'Failed to load checkup records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleSection = (sectionName: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRecordsForTrimester = (minWeeks: number, maxWeeks: number): CheckupRecord[] => {
    return records.filter((r) => r.aog_weeks >= minWeeks && r.aog_weeks <= maxWeeks);
  };

  const handleAddCheckup = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/checkups/add-checkup` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Prenatal Checkups" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading records...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Prenatal Checkups" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <MaterialCommunityIcons name="clipboard-text" size={28} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Prenatal Checkup Records</ThemedText>
          </View>
        </View>
      )}

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
          <View style={styles.summaryInfo}>
            <ThemedText style={styles.summaryValue}>{records.length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Checkups</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Checkup Records</ThemedText>
            <ThemedText style={styles.emptySubtext}>Prenatal checkup records will appear here</ThemedText>
          </View>
        ) : (
          <>
            {/* Trimester Sections */}
            {trimesters.map((trimester) => {
              const trimesterRecords = getRecordsForTrimester(trimester.minWeeks, trimester.maxWeeks);
              const isCollapsed = collapsedSections[trimester.name];

              return (
                <View key={trimester.name} style={styles.trimesterSection}>
                  {/* Trimester Header */}
                  <TouchableOpacity
                    style={[styles.trimesterHeader, { backgroundColor: trimester.color + '20' }]}
                    onPress={() => toggleSection(trimester.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.trimesterHeaderLeft}>
                      <Ionicons name={trimester.icon as any} size={24} color={trimester.color} />
                      <View style={styles.trimesterHeaderText}>
                        <ThemedText style={[styles.trimesterName, { color: trimester.color }]}>
                          {trimester.name}
                        </ThemedText>
                        <ThemedText style={styles.trimesterRange}>{trimester.range}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.trimesterHeaderRight}>
                      <View style={[styles.countBadge, { backgroundColor: trimester.color }]}>
                        <ThemedText style={styles.countText}>{trimesterRecords.length}</ThemedText>
                      </View>
                      <Ionicons
                        name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                        size={20}
                        color={trimester.color}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Trimester Content */}
                  {!isCollapsed && (
                    <View style={styles.trimesterContent}>
                      {trimesterRecords.length === 0 ? (
                        <View style={styles.emptyTrimester}>
                          <ThemedText style={styles.emptyTrimesterText}>
                            No checkups recorded for this trimester
                          </ThemedText>
                        </View>
                      ) : (
                        <>
                          {/* Table Header */}
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View>
                              <View style={styles.tableHeaderRow}>
                                <View style={[styles.tableHeaderCell, styles.dateColumn]}>
                                  <ThemedText style={styles.tableHeaderText}>Date</ThemedText>
                                </View>
                                <View style={[styles.tableHeaderCell, styles.aogColumn]}>
                                  <ThemedText style={styles.tableHeaderText}>AOG</ThemedText>
                                </View>
                                <View style={[styles.tableHeaderCell, styles.weightColumn]}>
                                  <ThemedText style={styles.tableHeaderText}>Weight (kg)</ThemedText>
                                </View>
                                <View style={[styles.tableHeaderCell, styles.heightColumn]}>
                                  <ThemedText style={styles.tableHeaderText}>Height (cm)</ThemedText>
                                </View>
                                <View style={[styles.tableHeaderCell, styles.bmiColumn]}>
                                  <ThemedText style={styles.tableHeaderText}>BMI</ThemedText>
                                </View>
                                <View style={[styles.tableHeaderCell, styles.bpColumn]}>
                                  <ThemedText style={styles.tableHeaderText}>BP</ThemedText>
                                </View>
                                <View style={[styles.tableHeaderCell, styles.fhrColumn]}>
                                  <ThemedText style={styles.tableHeaderText}>FHR</ThemedText>
                                </View>
                              </View>

                              {/* Table Rows */}
                              {trimesterRecords.map((record, index) => (
                                <View key={record.checkup_id}>
                                  <View
                                    style={[
                                      styles.tableRow,
                                      index === trimesterRecords.length - 1 && 
                                      !record.laboratory_results && 
                                      !record.notes && 
                                      styles.lastTableRow,
                                    ]}
                                  >
                                    <View style={[styles.tableCell, styles.dateColumn]}>
                                      <ThemedText style={styles.cellText}>
                                        {formatDate(record.date_of_checkup)}
                                      </ThemedText>
                                    </View>
                                    <View style={[styles.tableCell, styles.aogColumn]}>
                                      <ThemedText style={styles.cellText}>{record.aog_weeks} wks</ThemedText>
                                    </View>
                                    <View style={[styles.tableCell, styles.weightColumn]}>
                                      <ThemedText style={styles.cellText}>
                                        {record.weight_kg || 'N/A'}
                                      </ThemedText>
                                    </View>
                                    <View style={[styles.tableCell, styles.heightColumn]}>
                                      <ThemedText style={styles.cellText}>
                                        {record.height_cm || 'N/A'}
                                      </ThemedText>
                                    </View>
                                    <View style={[styles.tableCell, styles.bmiColumn]}>
                                      <ThemedText style={styles.cellText}>
                                        {record.bmi ? record.bmi.toFixed(1) : 'N/A'}
                                      </ThemedText>
                                    </View>
                                    <View style={[styles.tableCell, styles.bpColumn]}>
                                      <ThemedText style={styles.cellText}>
                                        {record.blood_pressure || 'N/A'}
                                      </ThemedText>
                                    </View>
                                    <View style={[styles.tableCell, styles.fhrColumn]}>
                                      <ThemedText style={styles.cellText}>
                                        {record.fetal_heart_rate ? `${record.fetal_heart_rate} bpm` : 'N/A'}
                                      </ThemedText>
                                    </View>
                                  </View>

                                  {/* ✅ UPDATED: Lab Results & Notes Row */}
                                  {(record.laboratory_results || record.notes) && (
                                    <View
                                        style={[
                                        styles.detailsRow,
                                        index === trimesterRecords.length - 1 && styles.lastTableRow,
                                        ]}
                                    >
                                        {record.laboratory_results && (
                                        <View style={styles.detailItem}>
                                            <ThemedText style={styles.detailLabel}>Lab Results: </ThemedText>
                                            <ThemedText style={styles.detailText}>
                                            {record.laboratory_results}
                                            </ThemedText>
                                        </View>
                                        )}
                                        {record.notes && (
                                        <View style={styles.detailItem}>
                                            <ThemedText style={styles.detailLabel}>Notes: </ThemedText>
                                            <ThemedText style={styles.detailText}>
                                            {record.notes}
                                            </ThemedText>
                                        </View>
                                        )}
                                    </View>
                                    )}
                                </View>
                              ))}
                            </View>
                          </ScrollView>
                        </>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* FAB button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddCheckup} activeOpacity={0.8}>
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
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 80,
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
  },
  trimesterSection: {
    marginBottom: theme.spacing.lg,
  },
  trimesterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  trimesterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  trimesterHeaderText: {
    flex: 1,
  },
  trimesterName: {
    fontSize: 16,
    fontWeight: '700',
  },
  trimesterRange: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  trimesterHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  trimesterContent: {
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyTrimester: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTrimesterText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
  },
  tableHeaderCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  cellText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  dateColumn: { width: 90 },
  aogColumn: { width: 70 },
  weightColumn: { width: 80 },
  heightColumn: { width: 80 },
  bmiColumn: { width: 60 },
  bpColumn: { width: 90 },
  fhrColumn: { width: 80 },
  
  detailsRow: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: 4,
    lineHeight: 18,
  },
  detailText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});