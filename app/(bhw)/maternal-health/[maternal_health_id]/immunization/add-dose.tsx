import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  BackHandler,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#8B5CF6',
    primaryLight: '#F3E8FF',
    success: '#10B981',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function AddTetanusDoseScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [maternalName, setMaternalName] = useState('');
  const [completedDoses, setCompletedDoses] = useState<number[]>([]);
  const [nextDose, setNextDose] = useState<number | null>(null);

  const [dateGiven, setDateGiven] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/immunization` as any);
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
    setDateGiven(new Date());
    const session = await getUserSession();
    setUserSession(session);

    //  Fetch maternal info
    const maternalResponse = await fetch(
      `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
    );
    const maternalData = await maternalResponse.json();

    if (maternalData.success) {
      setMaternalName(maternalData.data.full_name || '');
    }

    //  Fetch immunization track (correct endpoint with /track/)
    const trackResponse = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_IMMUNIZATION_TRACK(parseInt(maternal_health_id))}`
    );
    
    if (!trackResponse.ok) {
      throw new Error(`Failed to fetch immunization track: ${trackResponse.status}`);
    }

    const trackData = await trackResponse.json();
    console.log('✅ Immunization track data:', trackData);

    if (trackData.success) {
      //  Calculate which doses are completed
      const completed: number[] = [];
      
      if (trackData.data.first_dose) completed.push(1);
      if (trackData.data.second_dose) completed.push(2);
      if (trackData.data.third_dose) completed.push(3);
      if (trackData.data.fourth_dose) completed.push(4);
      if (trackData.data.fifth_dose) completed.push(5);
      
      setCompletedDoses(completed);

      //  Calculate next dose number
      if (!trackData.data.first_dose) {
        setNextDose(1);
      } else if (!trackData.data.second_dose) {
        setNextDose(2);
      } else if (!trackData.data.third_dose) {
        setNextDose(3);
      } else if (!trackData.data.fourth_dose) {
        setNextDose(4);
      } else if (!trackData.data.fifth_dose) {
        setNextDose(5);
      } else {
        // All doses completed
        setNextDose(null);
      }
    }
  } catch (error) {
    console.error('❌ Failed to load data:', error);
    Alert.alert('Error', 'Failed to load immunization data. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateGiven(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const validateForm = (): boolean => {
    if (!nextDose) {
      Alert.alert('Complete', 'All doses have been recorded');
      return false;
    }

    if (dateGiven > new Date()) {
      Alert.alert('Invalid Date', 'Date cannot be in the future');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Confirm',
      `Record Tetanus Dose ${nextDose} given on ${formatDate(dateGiven)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Record', onPress: submitDose }
      ]
    );
  };

  const submitDose = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      const payload = {
        dose_number: nextDose,
        date_given: dateGiven.toISOString().split('T')[0], // Format: YYYY-MM-DD
        personnel_id: personnelId,
      };

      console.log('📤 Submitting TT dose:', payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_IMMUNIZATION_ADD(parseInt(maternal_health_id))}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log('✅ Response:', data);

      if (response.ok && data.success) {
        Alert.alert(
          'Success',
          `TT Dose ${nextDose} has been recorded successfully`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.push(`/(bhw)/maternal-health/${maternal_health_id}/immunization` as any);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to record dose');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Tetanus Dose" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!nextDose) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Tetanus Dose" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
          <ThemedText style={styles.emptyText}>All Doses Complete</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            All 5 tetanus vaccination doses have been recorded
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Tetanus Dose" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <Ionicons name="woman" size={24} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>
              Recording Tetanus Dose {nextDose}
            </ThemedText>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Progress Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Vaccination Progress</ThemedText>
          </View>

          <View style={styles.progressInfo}>
            <ThemedText style={styles.progressText}>
              {completedDoses.length} of 5 doses completed
            </ThemedText>
          </View>

          <View style={styles.doseIndicators}>
            {[1, 2, 3, 4, 5].map((doseNum) => (
              <View
                key={doseNum}
                style={[
                  styles.doseIndicator,
                  completedDoses.includes(doseNum) && styles.doseIndicatorComplete,
                  doseNum === nextDose && styles.doseIndicatorNext,
                ]}
              >
                <ThemedText
                  style={[
                    styles.doseIndicatorText,
                    completedDoses.includes(doseNum) && styles.doseIndicatorTextComplete,
                    doseNum === nextDose && styles.doseIndicatorTextNext,
                  ]}
                >
                  {doseNum}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Dose Information</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Dose Number</ThemedText>
            <View style={styles.doseDisplay}>
              <ThemedText style={styles.doseText}>Dose {nextDose}</ThemedText>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Date Given *</ThemedText>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={styles.dateButtonText}>
                {formatDate(dateGiven)}
              </ThemedText>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateGiven}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.7}
        >
          <Ionicons name="medical" size={20} color="#FFFFFF" style={styles.submitButtonIcon} />
          <ThemedText style={styles.submitButtonText}>
            {submitting ? 'Recording...' : `Record Dose ${nextDose}`}
          </ThemedText>
        </TouchableOpacity>
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyText: {
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
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  bannerInfo: {
    flex: 1,
  },
  maternalName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  bannerSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
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
  progressInfo: {
    marginBottom: theme.spacing.lg,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  doseIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
  },
  doseIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doseIndicatorComplete: {
    backgroundColor: theme.colors.success,
  },
  doseIndicatorNext: {
    backgroundColor: theme.colors.primary,
  },
  doseIndicatorText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  doseIndicatorTextComplete: {
    color: '#FFFFFF',
  },
  doseIndicatorTextNext: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  doseDisplay: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  doseText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  dateButtonText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
   submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
   submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.disabled,
  },
  submitButtonIcon: {
    marginRight: theme.spacing.xs,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});