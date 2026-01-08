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

const theme = {
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#E1E4E8',
    borderLight: '#F0F2F5',
    primary: '#0066CC',
    primaryLight: '#E6F2FF',
    vitaminA: '#F59E0B',
    vitaminALight: '#FEF3C7',
    deworming: '#8B5CF6',
    dewormingLight: '#EDE9FE',
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

interface SupplementRecord {
  supplement_id: number;
  supplement_name: string;
  age_in_months: number;
  date_given: string;
  given_by?: number;
}

export default function ResidentChildSupplementsListScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<SupplementRecord[]>([]);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    fetchSupplements();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.back();
  };

  // Handle back button when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.back();
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [])
  );

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_SUPPLEMENTS_LIST(parseInt(child_health_id))}`
      );
      const data = await response.json();

      console.log('💊 Supplements response:', data);

      if (data.success) {
        setRecords(data.data || []);
        setChildName(data.child_name || '');
      } else {
        Alert.alert('Error', data.error || 'Failed to load supplement records');
      }
    } catch (error) {
      console.error('Failed to load supplements:', error);
      Alert.alert('Error', 'Failed to load supplement records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSupplements();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAge = (ageInMonths: number): string => {
    if (ageInMonths === 0) return 'Newborn';
    if (ageInMonths === 1) return '1 month';
    if (ageInMonths < 12) return `${ageInMonths} months`;
    
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    
    if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    return `${years}y ${months}m`;
  };

  const getSupplementColor = (supplementName: string) => {
    if (supplementName.toLowerCase().includes('vitamin')) {
      return {
        bg: theme.colors.vitaminALight,
        text: theme.colors.vitaminA,
        icon: 'medication' as const,
      };
    } else {
      return {
        bg: theme.colors.dewormingLight,
        text: theme.colors.deworming,
        icon: 'medication' as const,
      };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Supplements" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading supplements...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Supplements" onBackPress={handleBackPress} />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="vaccines" size={22} color={theme.colors.vitaminA} />
            <View>
              <ThemedText style={styles.childName}>{childName}</ThemedText>
              <ThemedText style={styles.recordCount}>
                {records.length} {records.length === 1 ? 'supplement' : 'supplements'}
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
            colors={[theme.colors.vitaminA]}
            tintColor={theme.colors.vitaminA}
          />
        }
      >
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="vaccines" size={56} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Supplement Records</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Track Vitamin A and deworming supplements
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {records.map((record, index) => {
              const colors = getSupplementColor(record.supplement_name);
              
              return (
                <View
                  key={`${record.supplement_id}-${record.date_given}`}
                  style={[styles.card, index === records.length - 1 && styles.lastCard]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.supplementBadge, { backgroundColor: colors.bg }]}>
                      <MaterialIcons name={colors.icon} size={16} color={colors.text} />
                      <ThemedText style={[styles.supplementName, { color: colors.text }]}>
                        {record.supplement_name}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <ThemedText style={styles.label}>Age When Given</ThemedText>
                    <ThemedText style={styles.value}>
                      {formatAge(record.age_in_months)}
                    </ThemedText>
                  </View>

                  <View style={styles.infoRow}>
                    <ThemedText style={styles.label}>Date Given</ThemedText>
                    <ThemedText style={styles.value}>
                      {formatDate(record.date_given)}
                    </ThemedText>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  listContainer: {
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardHeader: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  supplementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    gap: 6,
  },
  supplementName: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});