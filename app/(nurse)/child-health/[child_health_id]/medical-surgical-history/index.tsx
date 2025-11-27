import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#E1E4E8',
    borderLight: '#F0F2F5',
    primary: '#0066CC',
    primaryLight: '#E6F2FF',
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

interface MedicalCondition {
  rmh_id: number;
  medical_history_name: string;
  date_added: string;
}

interface SurgicalHistory {
  rsh_id: number;
  surgical_history_name: string;
  date_of_surgery: string;
  date_added: string;
}

type TabType = 'medical' | 'surgical';

export default function NurseMedicalSurgicalScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('medical');
  
  const [medicalRecords, setMedicalRecords] = useState<MedicalCondition[]>([]);
  const [surgicalRecords, setSurgicalRecords] = useState<SurgicalHistory[]>([]);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    fetchAllRecords();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(nurse)/child-health/${child_health_id}` as any);
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
    }, [child_health_id])
  );

  const fetchAllRecords = async () => {
    try {
      setLoading(true);

      // Fetch both medical and surgical history
      const [medicalResponse, surgicalResponse] = await Promise.all([
        fetch(`${API_BASE_URL}${API_ENDPOINTS.CHILD_MEDICAL_CONDITIONS_LIST(parseInt(child_health_id))}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.CHILD_SURGICAL_HISTORY_LIST(parseInt(child_health_id))}`)
      ]);

      const medicalData = await medicalResponse.json();
      const surgicalData = await surgicalResponse.json();

      if (medicalData.success) {
        setChildName(medicalData.child_name || '');
        setMedicalRecords(medicalData.data || []);
      }

      if (surgicalData.success) {
        if (!childName) setChildName(surgicalData.child_name || '');
        setSurgicalRecords(surgicalData.data || []);
      }

    } catch (error) {
      console.error('Failed to load records:', error);
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
          <ActivityIndicator size="large" color={theme.colors.danger} />
          <ThemedText style={styles.loadingText}>Loading records...</ThemedText>
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
            <MaterialIcons name="medical-services" size={22} color={theme.colors.danger} />
            <View>
              <ThemedText style={styles.childName}>{childName}</ThemedText>
              <ThemedText style={styles.recordCount}>
                {medicalRecords.length} medical • {surgicalRecords.length} surgical
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Info Notice - VIEW ONLY */}
      <View style={styles.infoNotice}>
        <Ionicons name="information-circle" size={16} color={theme.colors.primary} />
        <ThemedText style={styles.infoText}>
          You can view the child's medical and surgical history recorded by the BHW.
        </ThemedText>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'medical' && styles.activeTab]}
          onPress={() => setActiveTab('medical')}
        >
          <MaterialIcons 
            name="local-hospital" 
            size={18} 
            color={activeTab === 'medical' ? theme.colors.danger : theme.colors.textMuted} 
          />
          <ThemedText style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
            Medical ({medicalRecords.length})
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'surgical' && styles.activeTab]}
          onPress={() => setActiveTab('surgical')}
        >
          <MaterialIcons 
            name="healing" 
            size={18} 
            color={activeTab === 'surgical' ? theme.colors.warning : theme.colors.textMuted} 
          />
          <ThemedText style={[styles.tabText, activeTab === 'surgical' && styles.activeTabText]}>
            Surgical ({surgicalRecords.length})
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.danger]} />
        }
      >
        {currentRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name={activeTab === 'medical' ? 'local-hospital' : 'healing'} 
              size={56} 
              color={theme.colors.textMuted} 
            />
            <ThemedText style={styles.emptyTitle}>
              No {activeTab === 'medical' ? 'Medical Conditions' : 'Surgical History'}
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {activeTab === 'medical' 
                ? 'No medical conditions have been recorded. BHW will document any relevant conditions.'
                : 'No surgical history has been recorded. BHW will document any past surgeries.'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {activeTab === 'medical' ? (
              medicalRecords.map((record, index) => (
                <View
                  key={record.rmh_id}
                  style={[styles.card, index === medicalRecords.length - 1 && styles.lastCard]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.conditionBadge}>
                      <MaterialIcons name="local-hospital" size={12} color={theme.colors.danger} />
                      <ThemedText style={styles.conditionNumber}>
                        #{medicalRecords.length - index}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.conditionName}>
                    {record.medical_history_name}
                  </ThemedText>

                  <View style={styles.dateRow}>
                    <Ionicons name="calendar" size={14} color={theme.colors.textSecondary} />
                    <ThemedText style={styles.dateLabel}>Recorded:</ThemedText>
                    <ThemedText style={styles.dateValue}>
                      {formatDate(record.date_added)}
                    </ThemedText>
                  </View>
                </View>
              ))
            ) : (
              surgicalRecords.map((record, index) => (
                <View
                  key={record.rsh_id}
                  style={[
                    styles.card, 
                    { borderLeftColor: theme.colors.warning },
                    index === surgicalRecords.length - 1 && styles.lastCard
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.conditionBadge, { backgroundColor: theme.colors.warningLight }]}>
                      <MaterialIcons name="healing" size={12} color={theme.colors.warning} />
                      <ThemedText style={[styles.conditionNumber, { color: theme.colors.warning }]}>
                        #{surgicalRecords.length - index}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.conditionName}>
                    {record.surgical_history_name}
                  </ThemedText>

                  <View style={styles.dateSection}>
                    <View style={styles.dateRow}>
                      <Ionicons name="medical" size={14} color={theme.colors.textSecondary} />
                      <ThemedText style={styles.dateLabel}>Surgery Date:</ThemedText>
                      <ThemedText style={styles.dateValue}>
                        {formatDate(record.date_of_surgery)}
                      </ThemedText>
                    </View>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar" size={14} color={theme.colors.textSecondary} />
                      <ThemedText style={styles.dateLabel}>Recorded:</ThemedText>
                      <ThemedText style={styles.dateValueMuted}>
                        {formatDate(record.date_added)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))
            )}
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
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: 4,
    ...theme.shadow,
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
    backgroundColor: theme.colors.borderLight,
  },
  tabText: {
    fontSize: 14,
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
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
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
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
    ...theme.shadow,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardHeader: {
    marginBottom: theme.spacing.md,
  },
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
  conditionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  dateSection: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  dateLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  dateValueMuted: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
});