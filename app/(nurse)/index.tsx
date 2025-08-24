import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

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
  subtle: '#F1F5F9',
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

// ——— Data (sample) ———
const DATA = {
  totalPopulation: 1240,
  male: 610,
  female: 630,
  vaccinated: 892,
  unvaccinated: 348,
  todayAppointments: 18,
  pendingRecords: 3,
  pregnantMothers: 24,
  children: 210,
  purokDistribution: [
    { label: 'Purok 1', value: 320 },
    { label: 'Purok 2', value: 210 },
    { label: 'Purok 3', value: 280 },
    { label: 'Purok 4', value: 170 },
    { label: 'Purok 5', value: 260 },
  ],
  ageDistribution: [
    { label: '0-14', value: 210, color: COLORS.info },
    { label: '15-24', value: 180, color: COLORS.success },
    { label: '25-54', value: 580, color: COLORS.warning },
    { label: '55-64', value: 140, color: COLORS.purple },
    { label: '65+', value: 130, color: COLORS.primary },
  ],
};

// ——— Reusable ——–
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

// Simple Bar Chart Component
const SimpleBarChart: React.FC<{ data: typeof DATA.purokDistribution }> = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <View style={styles.simpleChart}>
      <View style={styles.chartBars}>
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 120;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barValueContainer}>
                <ThemedText style={styles.barValue}>{item.value}</ThemedText>
              </View>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height, 
                    backgroundColor: index % 2 === 0 ? COLORS.primary : COLORS.primaryDark 
                  }
                ]} 
              />
              <ThemedText style={styles.barLabel}>
                {item.label.replace('Purok ', 'P')}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Simple Progress Circle Component
const ProgressCircle: React.FC<{ percentage: number; color: string; size?: number }> = ({ 
  percentage, 
  color, 
  size = 80 
}) => {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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

// Age Distribution Component
const AgeDistribution: React.FC<{ data: typeof DATA.ageDistribution }> = ({ data }) => {
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
          <ThemedText style={styles.ageCenterLabel}>Total</ThemedText>
          <ThemedText style={styles.ageCenterValue}>{total}</ThemedText>
        </View>
      </View>
    </View>
  );
};

// ——— Screen ———
export default function NurseDashboard() {
  const vaccinationRate = Math.round(
    (DATA.vaccinated / DATA.totalPopulation) * 100
  );
  const malePct = Math.round((DATA.male / DATA.totalPopulation) * 100);
  const femalePct = 100 - malePct;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.welcome}>
              Good Morning 👋
            </ThemedText>
            <ThemedText style={styles.welcomeSub}>
              Today&apos;s health overview
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
              {DATA.pendingRecords} records need review
            </ThemedText>
          </View>
          <View style={styles.infoPill}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <ThemedText style={styles.infoText}>
              {DATA.todayAppointments} tasks today
            </ThemedText>
          </View>
        </View>

        {/* KPIs */}
        <SectionHeader title="Snapshot" />
        <View style={styles.grid2}>
          <StatCard
            title="Population"
            value={DATA.totalPopulation.toLocaleString()}
            subtitle="Active residents"
            icon="people"
            color={COLORS.primary}
          />
          <StatCard
            title="Vaccinated"
            value={`${vaccinationRate}%`}
            subtitle={`${DATA.vaccinated} residents`}
            icon="shield-checkmark"
            color={COLORS.success}
          />
          <StatCard
            title="Pending Records"
            value={DATA.pendingRecords}
            subtitle="Need review"
            icon="document-text"
            color={COLORS.warning}
          />
          <StatCard
            title="Today's Tasks"
            value={DATA.todayAppointments}
            subtitle="Appointments"
            icon="calendar"
            color={COLORS.info}
          />
        </View>

        {/* Demographics */}
        <SectionHeader
          title="Demographics"
          subtitle="Gender & monitored groups"
        />
        <View style={styles.grid2}>
          <StatCard
            title="Male"
            value={DATA.male}
            subtitle={`${malePct}% of population`}
            icon="man"
            color={COLORS.info}
          />
          <StatCard
            title="Female"
            value={DATA.female}
            subtitle={`${femalePct}% of population`}
            icon="woman"
            color={COLORS.purple}
          />
          <StatCard
            title="Pregnant Mothers"
            value={DATA.pregnantMothers}
            subtitle="Under monitoring"
            icon="heart"
            color={COLORS.primary}
          />
          <StatCard
            title="Children (0–14)"
            value={DATA.children}
            subtitle="Growth monitoring"
            icon="happy"
            color={COLORS.success}
          />
        </View>

        {/* Analytics */}
        <SectionHeader
          title="Analytics"
          subtitle="Population across puroks and age groups"
        />
        
        {/* Vaccination Progress */}
        <DashboardCard style={styles.progressCard}>
          <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
            Vaccination Progress
          </ThemedText>
          <View style={styles.progressContainer}>
            <ProgressCircle 
              percentage={vaccinationRate} 
              color={COLORS.success} 
              size={100} 
            />
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <ThemedText style={styles.progressStatValue}>{DATA.vaccinated}</ThemedText>
                <ThemedText style={styles.progressStatLabel}>Vaccinated</ThemedText>
              </View>
              <View style={styles.progressStat}>
                <ThemedText style={styles.progressStatValue}>{DATA.unvaccinated}</ThemedText>
                <ThemedText style={styles.progressStatLabel}>Unvaccinated</ThemedText>
              </View>
            </View>
          </View>
        </DashboardCard>

        <View style={styles.chartsWrap}>
          <DashboardCard style={styles.chartCard}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
              Residents per Purok
            </ThemedText>
            <SimpleBarChart data={DATA.purokDistribution} />
          </DashboardCard>

          <DashboardCard style={[styles.chartCard, styles.chartRight]}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
              Age Distribution
            </ThemedText>
            <AgeDistribution data={DATA.ageDistribution} />
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

  // Simple Bar Chart Styles
  simpleChart: {
    paddingVertical: 10,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barValueContainer: {
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  bar: {
    width: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Age Distribution Styles
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