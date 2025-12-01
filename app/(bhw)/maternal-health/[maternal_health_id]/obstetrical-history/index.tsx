import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl, 
  Alert,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';

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
        
        // Check if data exists and has records
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          console.log('✅ Has record - showing card');
          setHasRecord(true);
          setHistoryData(data.data[0]);
        } else {
          console.log('❌ No record - showing empty state');
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

  const handleAddRecord = () => {
    console.log('🔄 Navigating to add obstetrical history...');
    router.push(
      `/(bhw)/maternal-health/${maternal_health_id}/obstetrical-history/add-obstetrical-history` as any
    );
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
        contentContainerStyle={[
          styles.scrollContent,
          !hasRecord && styles.scrollContentCentered
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {!hasRecord ? (
          /* Empty State with Add Button */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="pregnant-woman" size={80} color={theme.colors.textMuted} />
            </View>
            <ThemedText style={styles.emptyTitle}>No Obstetrical History</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Add the mother's pregnancy history to track prenatal care and delivery information.
            </ThemedText>
            
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddRecord}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <View style={styles.addButtonTextContainer}>
                <ThemedText style={styles.addButtonText}>
                  Add Obstetrical History
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          /* Display Existing Record */
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
    flexGrow: 1,
  },
  scrollContentCentered: {
    justifyContent: 'center',
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
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  
  // Empty State Styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    maxWidth: 320,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 280,
    maxWidth: '90%',
  },
  addButtonTextContainer: {
    flexShrink: 1,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Card Styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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

  // GPA Section Styles
  gpaSection: {
    marginBottom: theme.spacing.lg,
  },
  gpaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
  },
  gpaItem: {
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  gpaValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Date Section Styles
  dateSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#F9FAFB',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  dateLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  dateValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },

  // Record Info Styles
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  recordInfoText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
});