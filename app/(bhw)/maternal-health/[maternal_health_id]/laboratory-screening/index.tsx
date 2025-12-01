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
    warningLight: '#FFF3CD',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface LabScreeningRecord {
  lab_screening_id: number;
  test_type_id: number;
  test_name: string;
  test_date: string;
  result: string | null;
  iron_tablet_given_date: string | null;
  iron_tablet_quantity: number | null;
  created_at: string;
}

export default function LaboratoryScreeningScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<LabScreeningRecord[]>([]);
  const [maternalName, setMaternalName] = useState('');

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

      // Fetch laboratory screening records
      const recordsResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_LAB_SCREENING_LIST(parseInt(maternal_health_id))}`
      );

      if (!recordsResponse.ok) {
        throw new Error(`HTTP ${recordsResponse.status}: ${recordsResponse.statusText}`);
      }

      const recordsData = await recordsResponse.json();

      console.log(' Laboratory screening response:', recordsData);

      if (recordsData.success) {
        setRecords(recordsData.data || []);
      } else {
        Alert.alert('Error', recordsData.error || 'Failed to load records');
      }
    } catch (error) {
      console.error('❌ Error loading laboratory screening:', error);
      Alert.alert('Error', 'Failed to load laboratory screening records. Please check if the endpoint exists.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getResultColor = (result: string | null) => {
    if (!result) {
      return { bg: theme.colors.primaryLight, text: theme.colors.primary };
    }

    const resultLower = result.toLowerCase();
    if (
      resultLower.includes('normal') ||
      resultLower.includes('negative') ||
      resultLower.includes('non-reactive') ||
      resultLower.includes('within normal limits')
    ) {
      return { bg: theme.colors.successLight, text: theme.colors.success };
    } else if (
      resultLower.includes('abnormal') ||
      resultLower.includes('positive') ||
      resultLower.includes('reactive')
    ) {
      return { bg: theme.colors.dangerLight, text: theme.colors.danger };
    }
    return { bg: theme.colors.primaryLight, text: theme.colors.primary };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Laboratory Screening" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading records...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Laboratory Screening" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <MaterialCommunityIcons name="test-tube" size={28} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Laboratory Test Results</ThemedText>
          </View>
        </View>
      )}

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="flask" size={24} color={theme.colors.primary} />
          <View style={styles.summaryInfo}>
            <ThemedText style={styles.summaryValue}>{records.length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Tests</ThemedText>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="pill" size={24} color={theme.colors.info} />
          <View style={styles.summaryInfo}>
            <ThemedText style={styles.summaryValue}>
              {records.filter((r) => r.iron_tablet_quantity && r.iron_tablet_quantity > 0).length}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Iron Given</ThemedText>
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
            <MaterialCommunityIcons name="flask-empty-outline" size={64} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Laboratory Screening Records</ThemedText>
            <ThemedText style={styles.emptySubtext}>Laboratory test results will appear here</ThemedText>
          </View>
        ) : (
          <View style={styles.tableCard}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <MaterialCommunityIcons name="table" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.tableTitle}>Test Results</ThemedText>
            </View>

            {/* Table Column Headers */}
            <View style={styles.tableHeaderRow}>
              <View style={[styles.tableHeaderCell, styles.testColumn]}>
                <ThemedText style={styles.tableHeaderText}>Test</ThemedText>
              </View>
              <View style={[styles.tableHeaderCell, styles.dateColumn]}>
                <ThemedText style={styles.tableHeaderText}>Date</ThemedText>
              </View>
              <View style={[styles.tableHeaderCell, styles.resultColumn]}>
                <ThemedText style={styles.tableHeaderText}>Result</ThemedText>
              </View>
            </View>

            {/* Table Data Rows */}
            {records.map((record, index) => {
              const resultColors = getResultColor(record.result);

              return (
                <View key={record.lab_screening_id} style={styles.recordGroup}>
                  {/*  Test Row with Card Style */}
                  <View style={styles.testCard}>
                    <View style={styles.tableRow}>
                      {/* Test Name Column */}
                      <View style={[styles.tableCell, styles.testColumn]}>
                        <View style={styles.testCellContent}>
                          <MaterialCommunityIcons name="flask" size={16} color={theme.colors.primary} />
                          <ThemedText style={styles.testText} numberOfLines={2}>
                            {record.test_name}
                          </ThemedText>
                        </View>
                      </View>

                      {/* Date Column */}
                      <View style={[styles.tableCell, styles.dateColumn]}>
                        <ThemedText style={styles.dateText}>{formatDate(record.test_date)}</ThemedText>
                      </View>

                      {/* Result Column -  Scrollable horizontally */}
                      <View style={[styles.tableCell, styles.resultColumn]}>
                        <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.resultScrollContent}
                        >
                          <View style={[styles.resultBadge, { backgroundColor: resultColors.bg }]}>
                            <ThemedText style={[styles.resultText, { color: resultColors.text }]}>
                              {record.result || 'Pending'}
                            </ThemedText>
                          </View>
                        </ScrollView>
                      </View>
                    </View>

                    {/*  Iron Tablet Row (if given) - Inside the card */}
                    {record.iron_tablet_given_date && record.iron_tablet_quantity && (
                      <View style={styles.ironRow}>
                        <View style={styles.ironContent}>
                          <Ionicons name="medical" size={14} color={theme.colors.info} />
                          <ThemedText style={styles.ironText}>
                            Iron Supplement: {record.iron_tablet_quantity} tablets given on{' '}
                            {formatDate(record.iron_tablet_given_date)}
                          </ThemedText>
                        </View>
                      </View>
                    )}
                  </View>

                  {/*  Distinct Separator between records */}
                  {index < records.length - 1 && <View style={styles.recordSeparator} />}
                </View>
              );
            })}
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
    paddingBottom: theme.spacing.xxl,
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

  tableCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
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
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
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

  recordGroup: {
    marginBottom: theme.spacing.md,
  },
  testCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  recordSeparator: {
    height: 2,
    backgroundColor: theme.colors.borderDark,
    marginVertical: theme.spacing.md,
    borderRadius: 1,
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 60,
  },
  tableCell: {
    justifyContent: 'center',
  },
  testColumn: {
    flex: 3,
    paddingRight: theme.spacing.sm,
  },
  dateColumn: {
    flex: 2,
    alignItems: 'center',
  },
  resultColumn: {
    flex: 2,
    alignItems: 'center',
  },
  testCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  testText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  resultScrollContent: {
    alignItems: 'center',
  },
  resultBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  ironRow: {
    backgroundColor: theme.colors.infoLight,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  ironContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ironText: {
    fontSize: 11,
    color: theme.colors.info,
    fontWeight: '600',
    flex: 1,
  },
});