import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl, // ✅ ADD THIS IMPORT
  Alert,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#EC4899',
    primaryLight: '#FDF2F8',
    success: '#10B981',
    warning: '#F59E0B',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface ObstetricalHistory {
  obs_id: number;
  gravida: number | null;
  para: number | null;
  abortion: number | null;
  last_menstrual_period: string | null;
  expected_date_of_delivery: string | null;
  created_at: string;
}

export default function ObstetricalHistoryScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasRecord, setHasRecord] = useState(false);
  const [historyData, setHistoryData] = useState<ObstetricalHistory | null>(null);
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

      const url = `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/obstetrical-history/`;
      console.log('📡 Fetching obstetrical history from:', url);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log('✅ Obstetrical history response:', data);

      if (data.success) {
        setMaternalName(data.maternal_name || '');
        
        if (data.data && data.data.length > 0) {
          setHasRecord(true);
          setHistoryData(data.data[0]);
        } else {
          setHasRecord(false);
          setHistoryData(null);
        }
      } else {
        console.error('❌ API error:', data.error);
        Alert.alert('Error', data.error || 'Failed to load obstetrical history');
      }
    } catch (error) {
      console.error('❌ Error loading obstetrical history:', error);
      Alert.alert('Error', 'Failed to load obstetrical history');
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
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Obstetrical History" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading obstetrical history...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Obstetrical History" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.infoCard}>
          <Ionicons name="woman" size={24} color={theme.colors.primary} />
          <ThemedText style={styles.infoText}>{maternalName}</ThemedText>
        </View>
      )}

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
        {!hasRecord ? (
          /* Empty State */
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
              <ThemedText style={styles.cardTitle}>No Record Found</ThemedText>
            </View>
            <ThemedText style={styles.emptyText}>
              No obstetrical history has been recorded yet. This information will be added by the Midwife during consultation.
            </ThemedText>
          </View>
        ) : (
          /* Display Record */
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="pregnant-woman" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.cardTitle}>Obstetrical History</ThemedText>
            </View>

            {/* GTPAL Information */}
            <View style={styles.gpaSection}>
              <View style={styles.gpaRow}>
                <View style={styles.gpaItem}>
                  <ThemedText style={styles.gpaLabel}>Gravida</ThemedText>
                  <ThemedText style={styles.gpaValue}>{historyData?.gravida ?? '—'}</ThemedText>
                </View>
                <View style={styles.gpaItem}>
                  <ThemedText style={styles.gpaLabel}>Para</ThemedText>
                  <ThemedText style={styles.gpaValue}>{historyData?.para ?? '—'}</ThemedText>
                </View>
                <View style={styles.gpaItem}>
                  <ThemedText style={styles.gpaLabel}>Abortion</ThemedText>
                  <ThemedText style={styles.gpaValue}>{historyData?.abortion ?? '—'}</ThemedText>
                </View>
              </View>
            </View>

            {/* Date Information */}
            <View style={styles.dateSection}>
              <View style={styles.dateRow}>
                <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                <ThemedText style={styles.dateLabel}>Last Menstrual Period:</ThemedText>
                <ThemedText style={styles.dateValue}>
                  {formatDate(historyData?.last_menstrual_period || null)}
                </ThemedText>
              </View>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <ThemedText style={styles.dateLabel}>Expected Delivery Date:</ThemedText>
                <ThemedText style={styles.dateValue}>
                  {formatDate(historyData?.expected_date_of_delivery || null)}
                </ThemedText>
              </View>
            </View>

            {/* Record Info */}
            <View style={styles.recordInfo}>
              <Ionicons name="time" size={14} color={theme.colors.textMuted} />
              <ThemedText style={styles.recordInfoText}>
                Recorded on {formatDate(historyData?.created_at || null)}
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
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
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  gpaSection: {
    marginBottom: theme.spacing.lg,
  },
  gpaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
  },
  gpaItem: {
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  gpaValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  dateSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dateLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  recordInfoText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});