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
    success: '#28A745',
    successLight: '#D4EDDA',
    warning: '#FFC107',
    danger: '#DC3545',
    info: '#17A2B8',
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

interface ImmunizationRecord {
  immunization_id: number;
  vaccine_name: string;
  dose_name: string;
  date_given: string;
  batch_number?: string;
  remarks?: string;
  given_by_name?: string;
}

export default function ImmunizationListScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    fetchImmunizationRecords();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/child-health/${child_health_id}` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [child_health_id])
  );

  const fetchImmunizationRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_LIST}${child_health_id}/immunizations/`
      );
      const data = await response.json();

      console.log('💉 Immunization records response:', data);

      if (data.success) {
        setRecords(data.data || []);
        setChildName(data.child_name || 'Child');
      } else {
        Alert.alert('Error', data.error || 'Failed to load immunization records');
      }
    } catch (error) {
      console.error('Failed to load immunization records:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchImmunizationRecords();
  };

  const handleAddRecord = () => {
    router.push(`/(bhw)/child-health/${child_health_id}/immunizations/add-immunization` as any);
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
        <CustomHeader title="Immunization Records" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading records...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Immunization Records" onBackPress={handleBackPress} />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="vaccines" size={22} color={theme.colors.primary} />
            <View>
              <ThemedText style={styles.childName}>{childName}</ThemedText>
              <ThemedText style={styles.recordCount}>
                {records.length} {records.length === 1 ? 'vaccine' : 'vaccines'}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.addIconButton} onPress={handleAddRecord}>
            <Ionicons name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

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
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="vaccines" size={56} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>No Immunization Records</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Track your child's vaccinations
            </ThemedText>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddRecord}>
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.emptyButtonText}>Add First Record</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          records.map((record, index) => (
            <View
              key={record.immunization_id}
              style={[styles.recordCard, index === records.length - 1 && styles.lastCard]}
            >
              {/* Vaccine Header */}
              <View style={styles.cardHeader}>
                <View style={styles.vaccineBadge}>
                  <MaterialIcons name="vaccines" size={16} color={theme.colors.primary} />
                  <ThemedText style={styles.vaccineText}>{record.vaccine_name}</ThemedText>
                </View>
                <View style={styles.doseBadge}>
                  <ThemedText style={styles.doseText}>{record.dose_name}</ThemedText>
                </View>
              </View>

              {/* Date Given */}
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Date Given</ThemedText>
                <View style={styles.valueContainer}>
                  <ThemedText style={styles.value}>{formatDate(record.date_given)}</ThemedText>
                </View>
              </View>

              {/* Batch Number */}
              {record.batch_number && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Batch Number</ThemedText>
                  <View style={styles.valueContainer}>
                    <ThemedText style={styles.value}>{record.batch_number}</ThemedText>
                  </View>
                </View>
              )}

              {/* Given By */}
              {record.given_by_name && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Given By</ThemedText>
                  <View style={styles.valueContainer}>
                    <ThemedText style={styles.value}>{record.given_by_name}</ThemedText>
                  </View>
                </View>
              )}

              {/* Remarks */}
              {record.remarks && (
                <>
                  <View style={styles.sectionDivider} />
                  <View style={styles.notesContainer}>
                    <ThemedText style={styles.label}>Remarks</ThemedText>
                    <ThemedText style={styles.notesText}>{record.remarks}</ThemedText>
                  </View>
                </>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {records.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddRecord} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
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
    marginBottom: theme.spacing.xl,
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
  recordCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  vaccineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    gap: 6,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  vaccineText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    flex: 1,
  },
  doseBadge: {
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  doseText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
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
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  notesContainer: {
    gap: theme.spacing.sm,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    backgroundColor: theme.colors.borderLight,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
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
    ...theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});