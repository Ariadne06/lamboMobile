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
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFF3CD',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface ImmunizationRecord {
  vaccine_type_id: number;
  vaccine_name: string;
  at_birth_given: boolean;
  first_dose_given: boolean;
  second_dose_given: boolean;
  third_dose_given: boolean;
  last_administered: string | null;
  next_recommended_date: string | null;
  is_delayed: boolean;
}

export default function NurseImmunizationListScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    fetchImmunizations();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(nurse)/child-health/${child_health_id}` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchImmunizations();
      
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [child_health_id])
  );

  const fetchImmunizations = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_LIST(parseInt(child_health_id))}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setChildName(data.child_name || '');
        setRecords(data.data || []);
      }
    } catch (error) {
      console.error('❌ Failed to load immunizations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchImmunizations();
  };

  const handleAddImmunization = () => {
    router.push(`/(nurse)/child-health/${child_health_id}/immunization/add-immunization` as any);
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

  const getCompletionStatus = (record: ImmunizationRecord): { 
    text: string; 
    color: string; 
    backgroundColor: string;
    icon: string;
  } => {
    const dosesGiven = [
      record.at_birth_given,
      record.first_dose_given,
      record.second_dose_given,
      record.third_dose_given,
    ].filter(Boolean).length;

    if (dosesGiven === 0) {
      return { 
        text: 'Not Started', 
        color: theme.colors.textMuted, 
        backgroundColor: '#F3F4F6',
        icon: 'ellipse-outline'
      };
    }
    
    if (record.is_delayed) {
      return { 
        text: 'Delayed', 
        color: theme.colors.danger, 
        backgroundColor: theme.colors.dangerLight,
        icon: 'warning'
      };
    }
    
    if (record.next_recommended_date) {
      return { 
        text: 'In Progress', 
        color: theme.colors.warning, 
        backgroundColor: theme.colors.warningLight,
        icon: 'time'
      };
    }
    
    return { 
      text: 'Complete', 
      color: theme.colors.success, 
      backgroundColor: theme.colors.successLight,
      icon: 'checkmark-circle'
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Immunization Schedule" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading immunization records...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Immunization Schedule" onBackPress={handleBackPress} />

      {childName && (
        <View style={styles.childBanner}>
          <Ionicons name="medical" size={24} color={theme.colors.primary} />
          <View style={styles.childInfo}>
            <ThemedText style={styles.childName}>{childName}</ThemedText>
            <ThemedText style={styles.childSubtext}>{records.length} vaccines tracked</ThemedText>
          </View>
          <TouchableOpacity style={styles.addIconButton} onPress={handleAddImmunization}>
            <Ionicons name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoNotice}>
        <Ionicons name="information-circle" size={16} color={theme.colors.primary} />
        <ThemedText style={styles.infoText}>
          Track and manage child immunizations according to the Philippine Immunization Schedule
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyText}>No immunization records yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Start tracking vaccines by adding the first dose</ThemedText>
          </View>
        ) : (
          records.map((record, index) => {
            const status = getCompletionStatus(record);
            
            return (
              <View key={record.vaccine_type_id} style={[styles.card, index === records.length - 1 && styles.lastCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.vaccineHeader}>
                    <Ionicons name="medical" size={18} color={theme.colors.primary} />
                    <ThemedText style={styles.vaccineText}>{record.vaccine_name}</ThemedText>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
                    <Ionicons name={status.icon as any} size={12} color={status.color} />
                    <ThemedText style={[styles.statusText, { color: status.color }]}>{status.text}</ThemedText>
                  </View>
                </View>

                <View style={styles.doseList}>
                  <View style={styles.doseRow}>
                    <Ionicons
                      name={record.at_birth_given ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={record.at_birth_given ? theme.colors.success : theme.colors.textMuted}
                    />
                    <ThemedText style={styles.doseLabel}>At Birth</ThemedText>
                  </View>
                  <View style={styles.doseRow}>
                    <Ionicons
                      name={record.first_dose_given ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={record.first_dose_given ? theme.colors.success : theme.colors.textMuted}
                    />
                    <ThemedText style={styles.doseLabel}>First Dose</ThemedText>
                  </View>
                  <View style={styles.doseRow}>
                    <Ionicons
                      name={record.second_dose_given ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={record.second_dose_given ? theme.colors.success : theme.colors.textMuted}
                    />
                    <ThemedText style={styles.doseLabel}>Second Dose</ThemedText>
                  </View>
                  <View style={styles.doseRow}>
                    <Ionicons
                      name={record.third_dose_given ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={record.third_dose_given ? theme.colors.success : theme.colors.textMuted}
                    />
                    <ThemedText style={styles.doseLabel}>Third Dose</ThemedText>
                  </View>
                </View>

                {(record.last_administered || record.next_recommended_date) && (
                  <View style={styles.dateSection}>
                    {record.last_administered && (
                      <View style={styles.dateRow}>
                        <Ionicons name="calendar" size={14} color={theme.colors.textSecondary} />
                        <ThemedText style={styles.dateLabel}>Last Given:</ThemedText>
                        <ThemedText style={styles.dateValue}>{formatDate(record.last_administered)}</ThemedText>
                      </View>
                    )}
                    {record.next_recommended_date && (
                      <View style={styles.dateRow}>
                        <Ionicons name="time" size={14} color={theme.colors.warning} />
                        <ThemedText style={styles.dateLabel}>Next Due:</ThemedText>
                        <ThemedText style={[styles.dateValue, { color: theme.colors.warning }]}>
                          {formatDate(record.next_recommended_date)}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB - Add Immunization */}
      <TouchableOpacity style={styles.fab} onPress={handleAddImmunization}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  childBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  childSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 16,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  vaccineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  vaccineText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  doseList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  doseLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  dateSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dateLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  dateValue: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
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