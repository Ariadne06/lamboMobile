import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#10B981',
    primaryLight: '#ECFDF5',
    iron: '#EF4444',
    ironLight: '#FEE2E2',
    calcium: '#3B82F6',
    calciumLight: '#DBEAFE',
    deworming: '#8B5CF6',
    dewormingLight: '#EDE9FE',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface SupplementRecord {
  maternal_supplement_id: number;
  supplement_type_id: number;
  supplement_name: string;
  date_given: string;
  number_of_tablets: number;
  trimester_name: string;
  created_at: string;
}

interface DewormingRecord {
  deworm_id: number;
  deworming_type_id: number;
  deworming_name: string;
  date_given: string;
  number_of_tablets: number;
  trimester_name: string;
  created_at: string;
}

type TabType = 'supplements' | 'deworming';

export default function ResidentSupplementsAndDewormingScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('supplements');
  
  const [supplements, setSupplements] = useState<SupplementRecord[]>([]);
  const [deworming, setDeworming] = useState<DewormingRecord[]>([]);
  const [maternalName, setMaternalName] = useState('');

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [maternal_health_id])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch maternal info
      const mhrResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const mhrData = await mhrResponse.json();
      if (mhrData.success && mhrData.data) {
        setMaternalName(mhrData.data.full_name || '');
      }

      // Fetch supplements
      const supResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/supplements/`
      );
      const supData = await supResponse.json();
      if (supData.success) {
        setSupplements(supData.data || []);
      }

      // Fetch deworming
      const dewormResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/deworming/`
      );
      const dewormData = await dewormResponse.json();
      if (dewormData.success) {
        setDeworming(dewormData.data || []);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleBackPress = () => {
    router.push(`/(tabs)/health/maternal/${maternal_health_id}` as any);
  };

  const handleAddSupplement = () => {
    router.push(`/(tabs)/health/maternal/${maternal_health_id}/supplements/add-supplement` as any);
  };

  const handleAddDeworming = () => {
    router.push(`/(tabs)/health/maternal/${maternal_health_id}/supplements/add-deworming` as any);
  };

  const getSupplementColor = (name: string) => {
    if (name.toLowerCase().includes('iron') || name.toLowerCase().includes('ifa')) {
      return { bg: theme.colors.ironLight, text: theme.colors.iron };
    }
    if (name.toLowerCase().includes('calcium')) {
      return { bg: theme.colors.calciumLight, text: theme.colors.calcium };
    }
    return { bg: theme.colors.primaryLight, text: theme.colors.primary };
  };

  const formatDate = (dateString: string): string => {
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
        <CustomHeader title="Supplements & Deworming" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const currentRecords = activeTab === 'supplements' ? supplements : deworming;
  const currentCount = currentRecords.length;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Supplements & Deworming" onBackPress={handleBackPress} />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="pill" size={24} color={theme.colors.primary} />
            <View>
              <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
              <ThemedText style={styles.recordCount}>
                {supplements.length + deworming.length} total records
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'supplements' && styles.activeTab]}
          onPress={() => setActiveTab('supplements')}
        >
          <MaterialCommunityIcons
            name="pill"
            size={18}
            color={activeTab === 'supplements' ? theme.colors.primary : theme.colors.textMuted}
          />
          <ThemedText style={[styles.tabText, activeTab === 'supplements' && styles.activeTabText]}>
            Supplements ({supplements.length})
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'deworming' && styles.activeTab]}
          onPress={() => setActiveTab('deworming')}
        >
          <MaterialCommunityIcons
            name="bottle-tonic"
            size={18}
            color={activeTab === 'deworming' ? theme.colors.deworming : theme.colors.textMuted}
          />
          <ThemedText style={[styles.tabText, activeTab === 'deworming' && styles.activeTabText]}>
            Deworming ({deworming.length})
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {currentRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name={activeTab === 'supplements' ? 'pill-off' : 'bottle-tonic-outline'}
              size={64}
              color={theme.colors.textMuted}
            />
            <ThemedText style={styles.emptyTitle}>
              No {activeTab === 'supplements' ? 'Supplements' : 'Deworming'} Yet
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {activeTab === 'supplements'
                ? 'Track Iron, Calcium, and other micronutrient supplements'
                : 'Track deworming medications (Albendazole)'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {activeTab === 'supplements'
              ? supplements.map((item) => {
                  const colors = getSupplementColor(item.supplement_name);
                  return (
                    <View key={item.maternal_supplement_id} style={styles.card}>
                      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                        <MaterialCommunityIcons name="pill" size={16} color={colors.text} />
                        <ThemedText style={[styles.badgeName, { color: colors.text }]}>
                          {item.supplement_name}
                        </ThemedText>
                      </View>

                      <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Trimester:</ThemedText>
                        <ThemedText style={styles.value}>{item.trimester_name}</ThemedText>
                      </View>

                      <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Date Given:</ThemedText>
                        <ThemedText style={styles.value}>{formatDate(item.date_given)}</ThemedText>
                      </View>

                      <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Tablets:</ThemedText>
                        <ThemedText style={styles.value}>{item.number_of_tablets}</ThemedText>
                      </View>
                    </View>
                  );
                })
              : deworming.map((item) => (
                  <View key={item.deworm_id} style={styles.card}>
                    <View style={[styles.badge, { backgroundColor: theme.colors.dewormingLight }]}>
                      <MaterialCommunityIcons name="bottle-tonic" size={16} color={theme.colors.deworming} />
                      <ThemedText style={[styles.badgeName, { color: theme.colors.deworming }]}>
                        {item.deworming_name}
                      </ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                      <ThemedText style={styles.label}>Trimester:</ThemedText>
                      <ThemedText style={styles.value}>{item.trimester_name}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                      <ThemedText style={styles.label}>Date Given:</ThemedText>
                      <ThemedText style={styles.value}>{formatDate(item.date_given)}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                      <ThemedText style={styles.label}>Tablets:</ThemedText>
                      <ThemedText style={styles.value}>{item.number_of_tablets}</ThemedText>
                    </View>
                  </View>
                ))}
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
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  maternalName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  recordCount: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
  },
  activeTab: {
    backgroundColor: theme.colors.border,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  activeTabText: {
    color: theme.colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
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
  listContainer: {
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});