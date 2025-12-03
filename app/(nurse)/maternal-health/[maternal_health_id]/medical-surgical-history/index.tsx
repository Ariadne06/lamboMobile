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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#E1E4E8',
    borderLight: '#F0F2F5',
    primary: '#EC4899',
    primaryLight: '#FDF2F8',
    danger: '#DC3545',
    dangerLight: '#FCE8EC',
    warning: '#F59E0B',
    warningLight: '#FFF3CD',
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

// Interfaces
interface MedicalCondition {
  mmh_id: number;
  m_medical_history_name: string;
  date_added: string;
}

interface SurgicalHistory {
  msh_id: number;
  m_surgical_history_name: string;
  date_of_surgery: string;
  date_added: string;
}

type TabType = 'medical' | 'surgical';

export default function NurseMaternalMedicalSurgicalScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('medical');

  const [medicalRecords, setMedicalRecords] = useState<MedicalCondition[]>([]);
  const [surgicalRecords, setSurgicalRecords] = useState<SurgicalHistory[]>([]);
  const [maternalName, setMaternalName] = useState('');

  useEffect(() => {
    fetchAllRecords();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    router.push(`/(nurse)/maternal-health/${maternal_health_id}`);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAllRecords();

      const onBackPress = () => {
        handleBackPress();
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [maternal_health_id])
  );

  const fetchAllRecords = async () => {
    try {
      setLoading(true);

      const maternalResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const maternalData = await maternalResponse.json();
      if (maternalData.success) {
        setMaternalName(maternalData.data.full_name || '');
      }

      const medicalResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/medical-conditions/`
      );
      const medicalData = await medicalResponse.json();
      if (medicalData.success) {
        setMedicalRecords(medicalData.data || []);
      }

      const surgicalResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/surgical-history/`
      );
      const surgicalData = await surgicalResponse.json();
      if (surgicalData.success) {
        setSurgicalRecords(surgicalData.data || []);
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to load medical/surgical history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllRecords();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Medical & Surgical History" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const currentRecords = activeTab === 'medical' ? medicalRecords : surgicalRecords;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Medical & Surgical History" onBackPress={handleBackPress} />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="woman" size={24} color={theme.colors.primary} />
            <View>
              <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
              <ThemedText style={styles.recordCount}>
                {activeTab === 'medical'
                  ? `${medicalRecords.length} medical condition(s)`
                  : `${surgicalRecords.length} surgical record(s)`
                }
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'medical' && styles.activeTab]}
          onPress={() => setActiveTab('medical')}
        >
          <Ionicons name="medical" size={18} color={activeTab === 'medical' ? theme.colors.textPrimary : theme.colors.textMuted} />
          <ThemedText style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
            Medical Conditions
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'surgical' && styles.activeTab]}
          onPress={() => setActiveTab('surgical')}
        >
          <Ionicons name="cut" size={18} color={activeTab === 'surgical' ? theme.colors.textPrimary : theme.colors.textMuted} />
          <ThemedText style={[styles.tabText, activeTab === 'surgical' && styles.activeTabText]}>
            Surgical History
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />}
      >
        {currentRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={64} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>
              No {activeTab === 'medical' ? 'Medical Conditions' : 'Surgical History'}
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              There are no records to display.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {activeTab === 'medical'
              ? medicalRecords.map((record, index) => (
                  <View key={record.mmh_id} style={[styles.card, index === medicalRecords.length - 1 && styles.lastCard]}>
                    <View style={styles.cardHeader}>
                      <View style={styles.conditionBadge}>
                        <Ionicons name="medical" size={14} color={theme.colors.danger} />
                        <ThemedText style={styles.conditionNumber}>#{index + 1}</ThemedText>
                      </View>
                    </View>

                    <ThemedText style={styles.conditionName}>{record.m_medical_history_name}</ThemedText>

                    <View style={styles.dateRow}>
                      <Ionicons name="calendar" size={12} color={theme.colors.textMuted} />
                      <ThemedText style={styles.dateLabel}>Date Added:</ThemedText>
                      <ThemedText style={styles.dateValue}>
                        {formatDate(record.date_added)}
                      </ThemedText>
                    </View>
                  </View>
                ))
              : surgicalRecords.map((record, index) => (
                  <View key={record.msh_id} style={[styles.card, index === surgicalRecords.length - 1 && styles.lastCard]}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.conditionBadge, { backgroundColor: theme.colors.warningLight }]}>
                        <Ionicons name="cut" size={14} color={theme.colors.warning} />
                        <ThemedText style={[styles.conditionNumber, { color: theme.colors.warning }]}>#{index + 1}</ThemedText>
                      </View>
                    </View>

                    <ThemedText style={styles.conditionName}>{record.m_surgical_history_name}</ThemedText>

                    <View style={styles.dateSection}>
                      <View style={styles.dateRow}>
                        <Ionicons name="calendar" size={12} color={theme.colors.textMuted} />
                        <ThemedText style={styles.dateLabel}>Surgery Date:</ThemedText>
                        <ThemedText style={styles.dateValue}>{formatDate(record.date_of_surgery)}</ThemedText>
                      </View>

                      <View style={styles.dateRow}>
                        <Ionicons name="time" size={12} color={theme.colors.textMuted} />
                        <ThemedText style={styles.dateLabel}>Recorded:</ThemedText>
                        <ThemedText style={styles.dateValueMuted}>{formatDate(record.date_added)}</ThemedText>
                      </View>
                    </View>
                  </View>
                ))}
          </View>
        )}
      </ScrollView>

      {/* 🚫 NO FAB — VIEW ONLY */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md },
  loadingText: { fontSize: 14, color: theme.colors.textSecondary },

  headerCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    ...theme.shadow,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  maternalName: { fontSize: 17, fontWeight: '600', color: theme.colors.textPrimary },
  recordCount: { fontSize: 13, color: theme.colors.textSecondary },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    padding: 4,
    ...theme.shadow,
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.md, gap: theme.spacing.xs },
  activeTab: { backgroundColor: theme.colors.borderLight },
  tabText: { fontSize: 14, fontWeight: '600', color: theme.colors.textMuted },
  activeTabText: { color: theme.colors.textPrimary },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 80 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: theme.spacing.lg },
  emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },

  listContainer: { gap: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
    ...theme.shadow,
  },
  lastCard: { marginBottom: 0 },

  cardHeader: { marginBottom: theme.spacing.md },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.dangerLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: 6,
  },
  conditionNumber: { fontSize: 12, fontWeight: '600', color: theme.colors.danger },
  conditionName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: theme.spacing.md },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  dateLabel: { fontSize: 12, color: theme.colors.textSecondary },
  dateValue: { fontSize: 12, color: theme.colors.textPrimary, fontWeight: '600' },
  dateValueMuted: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500' },

  dateSection: { marginTop: theme.spacing.md },
});
