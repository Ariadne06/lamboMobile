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
    primary: '#8B5CF6',
    primaryLight: '#F3E8FF',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface DiseaseRecord {
  ids_id: number;
  disease_type_id: number;
  disease_name: string;
  screening_date: string;
  result: string | null;
  created_at: string;
}

export default function ResidentDiseaseSurveillanceScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<DiseaseRecord[]>([]);
  const [maternalName, setMaternalName] = useState('');

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

      if (maternalData.success) {
        setMaternalName(maternalData.data.full_name || '');
      }

      // Fetch disease surveillance records
      const recordsResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_DISEASE_SURVEILLANCE_LIST(parseInt(maternal_health_id))}`
      );
      const recordsData = await recordsResponse.json();

      console.log('✅ Disease surveillance response:', recordsData);

      if (recordsData.success) {
        setRecords(recordsData.data || []);
      }
    } catch (error) {
      console.error('❌ Error loading disease surveillance:', error);
      Alert.alert('Error', 'Failed to load disease surveillance records');
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
    if (resultLower.includes('negative') || resultLower.includes('non-reactive')) {
      return { bg: theme.colors.successLight, text: theme.colors.success };
    } else if (resultLower.includes('positive') || resultLower.includes('reactive')) {
      return { bg: theme.colors.dangerLight, text: theme.colors.danger };
    }
    return { bg: theme.colors.primaryLight, text: theme.colors.primary };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Disease Surveillance" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading records...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Disease Surveillance" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <MaterialCommunityIcons name="shield-search" size={28} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Infectious Disease Surveillance</ThemedText>
          </View>
        </View>
      )}

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="virus" size={24} color={theme.colors.primary} />
          <View style={styles.summaryInfo}>
            <ThemedText style={styles.summaryValue}>{records.length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Screenings</ThemedText>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.success} />
          <View style={styles.summaryInfo}>
            <ThemedText style={styles.summaryValue}>
              {records.filter((r) => r.result && r.result.toLowerCase().includes('negative')).length}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Negative</ThemedText>
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
            <MaterialCommunityIcons name="shield-search" size={64} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Disease Surveillance Records</ThemedText>
            <ThemedText style={styles.emptySubtext}>Disease screening records will appear here</ThemedText>
          </View>
        ) : (
          <View style={styles.tableCard}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <MaterialCommunityIcons name="table" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.tableTitle}>Screening Records</ThemedText>
            </View>

            {/* Table Column Headers */}
            <View style={styles.tableHeaderRow}>
              <View style={[styles.tableHeaderCell, styles.diseaseColumn]}>
                <ThemedText style={styles.tableHeaderText}>Disease</ThemedText>
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
                <View
                  key={record.ids_id}
                  style={[styles.tableRow, index === records.length - 1 && styles.lastTableRow]}
                >
                  {/* Disease Name Column */}
                  <View style={[styles.tableCell, styles.diseaseColumn]}>
                    <View style={styles.diseaseCellContent}>
                      <MaterialCommunityIcons name="virus" size={16} color={theme.colors.primary} />
                      <ThemedText style={styles.diseaseText} numberOfLines={2}>
                        {record.disease_name}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Date Column */}
                  <View style={[styles.tableCell, styles.dateColumn]}>
                    <ThemedText style={styles.dateText}>{formatDate(record.screening_date)}</ThemedText>
                  </View>

                  {/* Result Column */}
                  <View style={[styles.tableCell, styles.resultColumn]}>
                    <View style={[styles.resultBadge, { backgroundColor: resultColors.bg }]}>
                      <ThemedText style={[styles.resultText, { color: resultColors.text }]} numberOfLines={1}>
                        {record.result || 'Pending'}
                      </ThemedText>
                    </View>
                  </View>
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

  // 📊 TABLE STYLES
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
    marginBottom: theme.spacing.sm,
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
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 60,
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    justifyContent: 'center',
  },
  diseaseColumn: {
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
  diseaseCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  diseaseText: {
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
  resultBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});