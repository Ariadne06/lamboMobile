import { ThemedText } from '@/components/ThemedText';
import { BHWDashboardData, fetchBHWDashboard } from '@/utils/dashboardService';
import { getUserSession } from '@/utils/session';
import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ——— Theme ——-
const COLORS = {
  primary: '#FF3D33',
  primaryDark: '#E5312A',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  subtle: '#FFFFFF',
};

// ——— Types ———
type DashboardCardProps = { children: ReactNode; style?: StyleProp<ViewStyle> };
type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  style?: StyleProp<ViewStyle>;
};
type SectionHeaderProps = { title: string; subtitle?: string };

// ——— Reusable Components ——–
const DashboardCard: React.FC<DashboardCardProps> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  style,
}) => (
  <DashboardCard style={[styles.statCard, style]}>
    <View style={styles.statTop}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}12` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <ThemedText type="default" style={[styles.statValue, { color }]}>
        {value}
      </ThemedText>
    </View>
    <ThemedText type="defaultSemiBold" style={styles.statTitle}>
      {title}
    </ThemedText>
    {!!subtitle && (
      <ThemedText type="default" style={styles.statSubtitle}>
        {subtitle}
      </ThemedText>
    )}
  </DashboardCard>
);

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <ThemedText type="title" style={styles.sectionTitle}>
      {title}
    </ThemedText>
    {!!subtitle && (
      <ThemedText type="default" style={styles.sectionSubtitle}>
        {subtitle}
      </ThemedText>
    )}
  </View>
);

// Horizontal Bar Chart Component for Households
const HouseholdBarChart: React.FC<{ data: Array<{ label: string; value: number }> }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyChartContainer}>
        <Ionicons name="bar-chart-outline" size={48} color={COLORS.textSecondary} />
        <ThemedText style={styles.emptyChartText}>No purok data available</ThemedText>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <View style={styles.horizontalChart}>
      {data.map((item, index) => {
        const barWidth = (item.value / maxValue) * 100;
        return (
          <View key={index} style={styles.horizontalBarRow}>
            <ThemedText style={styles.horizontalBarLabel} numberOfLines={1}>
              {item.label.replace('Sitio ', '')}
            </ThemedText>
            <View style={styles.horizontalBarWrapper}>
              <View 
                style={[
                  styles.horizontalBar,
                  { 
                    width: `${barWidth}%`,
                    backgroundColor: index % 2 === 0 ? COLORS.primary : COLORS.primaryDark 
                  }
                ]} 
              />
            </View>
            <ThemedText style={styles.horizontalBarValue}>{item.value}</ThemedText>
          </View>
        );
      })}
    </View>
  );
};

// Simple Progress Circle Component
const ProgressCircle: React.FC<{ percentage: number; color: string; size?: number }> = ({ 
  percentage, 
  color, 
  size = 80 
}) => {
  return (
    <View style={[styles.progressCircle, { width: size, height: size }]}>
      <View style={[styles.progressBackground, { width: size - 16, height: size - 16, borderRadius: (size - 16) / 2 }]} />
      <View style={[styles.progressFill, { 
        width: size - 16, 
        height: size - 16, 
        borderRadius: (size - 16) / 2,
        borderColor: color,
        borderWidth: 8,
        transform: [{ rotate: `${(percentage / 100) * 360}deg` }]
      }]} />
      <View style={styles.progressCenter}>
        <ThemedText style={[styles.progressText, { color }]}>{percentage}%</ThemedText>
      </View>
    </View>
  );
};

// Health Category Distribution Component
const HealthCategoryDistribution: React.FC<{ data: Array<{ label: string; value: number; color: string }> }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <View style={styles.ageDistribution}>
      <View style={styles.ageList}>
        {data.map((item, index) => {
          const percentage = Math.round((item.value / total) * 100);
          return (
            <View key={index} style={styles.ageItem}>
              <View style={styles.ageItemLeft}>
                <View style={[styles.ageColorDot, { backgroundColor: item.color }]} />
                <ThemedText style={styles.ageLabel}>{item.label}</ThemedText>
              </View>
              <View style={styles.ageItemRight}>
                <ThemedText style={styles.ageValue}>{item.value}</ThemedText>
                <ThemedText style={styles.agePercentage}>({percentage}%)</ThemedText>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.ageVisual}>
        <View style={styles.ageCenter}>
          <ThemedText style={styles.ageCenterLabel}>Total Records</ThemedText>
          <ThemedText style={styles.ageCenterValue}>{total}</ThemedText>
        </View>
      </View>
    </View>
  );
};

// ——— Screen ———
export default function BHWDashboard() {
  const [dashboardData, setDashboardData] = useState<BHWDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const session = await getUserSession();
      if (!session || !session.user_id) {
        Alert.alert('Error', 'No user session found');
        return;
      }

      console.log('📥 Fetching BHW dashboard for personnel_id:', session.user_id);
      const data = await fetchBHWDashboard(session.user_id);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.textSecondary} />
          <ThemedText style={styles.loadingText}>No data available</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const totalPopulation = dashboardData.total_male + dashboardData.total_female;
  const malePct = totalPopulation > 0 ? Math.round((dashboardData.total_male / totalPopulation) * 100) : 0;
  const femalePct = 100 - malePct;

  // Transform API data for charts
  console.log('🏘️ RAW households_per_purok:', dashboardData.households_per_purok);
  console.log('📋 Is Array?', Array.isArray(dashboardData.households_per_purok));
  console.log('📏 Length:', dashboardData.households_per_purok?.length);
  
  if (dashboardData.households_per_purok && dashboardData.households_per_purok.length > 0) {
    console.log('📦 First item:', dashboardData.households_per_purok[0]);
    console.log('🔑 First item keys:', Object.keys(dashboardData.households_per_purok[0]));
  }

  const householdDistribution = Array.isArray(dashboardData.households_per_purok) 
    ? dashboardData.households_per_purok.map(item => {
        console.log('🔄 Mapping item:', item);
        return {
          label: item.sitio_name,
          value: item.total_households,
        };
      })
    : [];

  console.log('📊 Transformed household distribution:', householdDistribution);

  const healthCategoryDistribution = [
    { label: 'Age 0-5', value: dashboardData.age_group_0_5, color: COLORS.info },
    { label: 'Age 6-12', value: dashboardData.age_group_6_12, color: COLORS.success },
    { label: 'Age 13-17', value: dashboardData.age_group_13_17, color: COLORS.warning },
    { label: 'Age 18-59', value: dashboardData.age_group_18_59, color: COLORS.purple },
    { label: 'Age 60+', value: dashboardData.age_group_60_plus, color: COLORS.primary },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.welcome}>
              Good Morning 👋
            </ThemedText>
            <ThemedText style={styles.welcomeSub}>
              BHW Health Management Overview
            </ThemedText>
          </View>
          <View style={styles.profile}>
            <Ionicons name="person-circle" size={38} color={COLORS.primary} />
          </View>
        </View>

        {/* Priority strip */}
        <View style={styles.infoStrip}>
          <View style={styles.infoPill}>
            <View style={[styles.dot, { backgroundColor: COLORS.warning }]} />
            <ThemedText style={styles.infoText}>
              {dashboardData.hh_not_visited_count + dashboardData.fam_not_visited_count} visits pending
            </ThemedText>
          </View>
          <View style={styles.infoPill}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <ThemedText style={styles.infoText}>
              {dashboardData.households_visited_today_by_bhw} visited today
            </ThemedText>
          </View>
        </View>

        {/* KPIs */}
        <SectionHeader title="Overview" />
        <View style={styles.grid2}>
          <StatCard
            title="Total Households"
            value={dashboardData.total_households.toLocaleString()}
            subtitle="Registered families"
            icon="home"
            color={COLORS.primary}
          />
          <StatCard
            title="Total Families"
            value={dashboardData.total_families.toLocaleString()}
            subtitle="Active families"
            icon="people"
            color={COLORS.info}
          />
          <StatCard
            title="Visited Today"
            value={dashboardData.households_visited_today_by_bhw}
            subtitle="By this BHW"
            icon="checkmark-circle"
            color={COLORS.success}
          />
          <StatCard
            title="Upcoming Immunization"
            value={dashboardData.total_children_upcoming_immun_5d}
            subtitle="Next 5 days"
            icon="medical"
            color={COLORS.warning}
          />
        </View>

        {/* Demographics */}
        <SectionHeader
          title="Demographics"
          subtitle="Population breakdown & special groups"
        />
        <View style={styles.grid2}>
          <StatCard
            title="Male"
            value={dashboardData.total_male}
            subtitle={`${malePct}% of population`}
            icon="man"
            color={COLORS.info}
          />
          <StatCard
            title="Female"
            value={dashboardData.total_female}
            subtitle={`${femalePct}% of population`}
            icon="woman"
            color={COLORS.purple}
          />
          <StatCard
            title="Pregnant Mothers"
            value={dashboardData.total_active_maternal}
            subtitle="Under monitoring"
            icon="heart"
            color={COLORS.primary}
          />
          <StatCard
            title="Children (0–5)"
            value={dashboardData.age_group_0_5}
            subtitle="Growth monitoring"
            icon="happy"
            color={COLORS.success}
          />
        </View>

        {/* Analytics */}
        <SectionHeader
          title="Analytics"
          subtitle="Household distribution and health records"
        />
        
        {/* Visitation Progress Cards */}
        <View style={styles.progressCardsWrap}>
          <DashboardCard style={styles.progressCardHalf}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
              Household Visitation
            </ThemedText>
            <View style={styles.progressContainer}>
              <ProgressCircle 
                percentage={Math.round(dashboardData.hh_visited_percent)} 
                color={COLORS.primary} 
                size={100} 
              />
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <ThemedText style={styles.progressStatValue}>{dashboardData.hh_visited_count}</ThemedText>
                  <ThemedText style={styles.progressStatLabel}>Visited</ThemedText>
                </View>
                <View style={styles.progressStat}>
                  <ThemedText style={styles.progressStatValue}>{dashboardData.hh_not_visited_count}</ThemedText>
                  <ThemedText style={styles.progressStatLabel}>Not Visited</ThemedText>
                </View>
              </View>
            </View>
          </DashboardCard>

          <DashboardCard style={styles.progressCardHalf}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
              Family Visitation
            </ThemedText>
            <View style={styles.progressContainer}>
              <ProgressCircle 
                percentage={Math.round(dashboardData.fam_visited_percent)} 
                color={COLORS.success} 
                size={100} 
              />
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <ThemedText style={styles.progressStatValue}>{dashboardData.fam_visited_count}</ThemedText>
                  <ThemedText style={styles.progressStatLabel}>Visited</ThemedText>
                </View>
                <View style={styles.progressStat}>
                  <ThemedText style={styles.progressStatValue}>{dashboardData.fam_not_visited_count}</ThemedText>
                  <ThemedText style={styles.progressStatLabel}>Not Visited</ThemedText>
                </View>
              </View>
            </View>
          </DashboardCard>
        </View>

        <View style={styles.chartsWrap}>
          <DashboardCard style={styles.chartCard}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
              Households per Purok
            </ThemedText>
            <HouseholdBarChart data={householdDistribution} />
          </DashboardCard>

          <DashboardCard style={[styles.chartCard, styles.chartRight]}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
              Age Group Distribution
            </ThemedText>
            <HealthCategoryDistribution data={healthCategoryDistribution} />
          </DashboardCard>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ——— Styles ———
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcome: { fontSize: 20, color: COLORS.textPrimary },
  welcomeSub: { color: COLORS.textSecondary, marginTop: 2 },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionHeader: { paddingHorizontal: 16, marginTop: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 18, color: COLORS.textPrimary },
  sectionSubtitle: { color: COLORS.textSecondary, marginTop: 2 },

  infoStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.subtle,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 8, marginRight: 8 },
  infoText: { color: COLORS.textSecondary, fontSize: 12 },

  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    flexBasis: '48%',
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '700' },
  statTitle: { fontSize: 13, color: COLORS.textPrimary },
  statSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // Progress Card Styles
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressCardsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  progressCardHalf: {
    flexGrow: 1,
    flexBasis: 340,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  progressCircle: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    backgroundColor: COLORS.subtle,
  },
  progressFill: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  progressCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressStats: {
    flex: 1,
    gap: 12,
  },
  progressStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressStatLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  chartsWrap: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chartCard: {
    flexGrow: 1,
    flexBasis: 340,
    paddingTop: 12,
  },
  chartRight: { },
  chartTitle: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 10 },

  // Horizontal Bar Chart Styles
  horizontalChart: {
    paddingVertical: 8,
    gap: 12,
  },
  emptyChartContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyChartText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  horizontalBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalBarLabel: {
    fontSize: 11,
    color: COLORS.textPrimary,
    width: 70,
    fontWeight: '500',
  },
  horizontalBarWrapper: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.subtle,
    borderRadius: 4,
    overflow: 'hidden',
  },
  horizontalBar: {
    height: 24,
    borderRadius: 4,
  },
  horizontalBarValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    width: 25,
    textAlign: 'right',
  },

  // Health Category Distribution Styles (reused from age distribution)
  ageDistribution: {
    gap: 16,
  },
  ageList: {
    gap: 8,
  },
  ageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ageColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ageLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  ageItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ageValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  agePercentage: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  ageVisual: {
    alignItems: 'center',
    paddingTop: 16,
  },
  ageCenter: {
    alignItems: 'center',
    backgroundColor: COLORS.subtle,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  ageCenterLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ageCenterValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
