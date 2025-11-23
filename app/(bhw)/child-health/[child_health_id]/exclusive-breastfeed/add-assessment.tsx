import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    breastfeed: '#EC4899',
    breastfeedLight: '#FDF2F8',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface Month {
  month_id: number;
  month_number: number;
  month_sequence_name: string;
}

export default function AddBreastfeedAssessmentScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(null);
  const [months, setMonths] = useState<Month[]>([]);
  const [monthId, setMonthId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/child-health/${child_health_id}/exclusive-breastfeed` as any);
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

  const loadData = async () => {
    try {
        setLoading(true);
        const session = await getUserSession();
        setUserSession(session);

        // Get child info
        const childResponse = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/`
        );
        const childData = await childResponse.json();

        if (childData.success) {
        setChildInfo(childData.data);
        }

        //  FIX: Correct endpoint for months
        const monthsResponse = await fetch(`${API_BASE_URL}/household_api/months/`);
        const monthsData = await monthsResponse.json();

        console.log(' Months API Response:', monthsData); // Debug log

        //  Handle different response formats
        if (Array.isArray(monthsData)) {
        // If response is direct array
         await fetchAndMarkAssessedMonths(monthsData);
        } else if (monthsData.success && monthsData.data) {
        // If response is wrapped in success/data
         await fetchAndMarkAssessedMonths(monthsData.data);
        } else if (monthsData.results) {
        // If response uses results key
         await fetchAndMarkAssessedMonths(monthsData.results);
        } else {
         console.error('❌ Unexpected months data format:', monthsData);
         Alert.alert('Error', 'Failed to load months data');
        }

      } catch (error) {
        console.error('Failed to load data:', error);
        Alert.alert('Error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    const fetchAndMarkAssessedMonths = async (monthsData: Month[]) => {
            try {
                // Get tracking data to mark assessed months
                const trackingResponse = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.CHILD_EXCLUSIVE_BREASTFEED_LIST(parseInt(child_health_id))}`
                );
                const trackingData = await trackingResponse.json();
                
                console.log('🔍 Tracking Data Response:', trackingData); // Debug log
                
                if (trackingData.success && trackingData.data) {
                // Mark which months are already assessed
                const assessedMonthIds = trackingData.data
                    .filter((m: any) => m.date_assessed !== null)
                    .map((m: any) => m.month_id);
                
                console.log('✅ Assessed Month IDs:', assessedMonthIds); // Debug log
                
                // Add 'isAssessed' flag to months
                const monthsWithStatus = monthsData.map((m: any) => ({
                    ...m,
                    isAssessed: assessedMonthIds.includes(m.month_id)
                }));
                
                setMonths(monthsWithStatus);
                } else {
                // If tracking data fails, just show all months without status
                setMonths(monthsData);
                }
            } catch (error) {
                console.error('❌ Failed to fetch tracking data:', error);
                // If error, just show all months without status
                setMonths(monthsData);
            }
        };

  const handleSubmit = async () => {
    if (!monthId) {
      Alert.alert('Required', 'Please select a month');
      return;
    }

    const selectedMonth = months.find(m => m.month_id === monthId);
    
    Alert.alert(
      'Confirm Assessment',
      `Mark ${selectedMonth?.month_sequence_name} as assessed?\n\nNote: All previous months will be automatically marked if not already assessed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: submitAssessment }
      ]
    );
  };

  const submitAssessment = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      const payload = {
        personnel_id: personnelId,
        month_id: monthId,
      };

      console.log('📤 Submitting assessment:', payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_EXCLUSIVE_BREASTFEED_ADD(parseInt(child_health_id))}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
            'Success',
            data.message || 'Assessment recorded successfully!',
            [
                {
                    text: 'View List',
                    onPress: () => router.push(`/(bhw)/child-health/${child_health_id}/exclusive-breastfeed` as any),
                },
            ]
        );
    } else {
        //  ENHANCED ERROR HANDLING
        const errorMessage = data.error || 'Failed to record assessment';
        
        // Check if it's the "already assessed" error
        if (response.status === 409 || errorMessage.includes('already assessed') || errorMessage.includes('already recorded')) {
            Alert.alert(
            'Month Already Assessed',
            errorMessage,
                [
                    { 
                    text: 'View Progress', 
                    onPress: () => router.push(`/(bhw)/child-health/${child_health_id}/exclusive-breastfeed` as any)
                    },
                    { 
                    text: 'Try Again',
                    style: 'default'
                    }
                ]
            );
        } else {
            // Generic error
            Alert.alert('Error', errorMessage);
        }
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
        <CustomHeader title="Add Assessment" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.breastfeed} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Assessment" onBackPress={handleBackPress} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Child Info */}
          {childInfo && (
            <View style={styles.childInfoCard}>
              <MaterialIcons name="child-care" size={20} color={theme.colors.breastfeed} />
              <View style={styles.childInfo}>
                <ThemedText style={styles.childName}>{childInfo.child_full_name}</ThemedText>
                <ThemedText style={styles.childSubtext}>
                  Feeding: {childInfo.feeding_method_name}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.cardTitle}>How It Works</ThemedText>
            </View>

            <View style={styles.instructionList}>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.instructionText}>
                  Select the current month you want to assess
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.instructionText}>
                  All previous months will be automatically marked if not already assessed
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <ThemedText style={styles.instructionText}>
                  Exclusive breastfeeding is tracked for months 1 to 6 only
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="calendar-today" size={20} color={theme.colors.breastfeed} />
              <ThemedText style={styles.cardTitle}>Select Month</ThemedText>
            </View>

            <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Assessment Month *</ThemedText>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={monthId}
                        onValueChange={(value) => setMonthId(value)}
                        style={styles.picker}
                        enabled={months.length > 0}
                        >
                        <Picker.Item label="Select month" value={null} />
                        {months.map((month: any) => (
                            <Picker.Item
                            key={month.month_id}
                            label={`${month.month_sequence_name} (Month ${month.month_number})${month.isAssessed ? ' ✓ Assessed' : ''}`}
                            value={month.month_id}
                            enabled={!month.isAssessed} // ✅ Disable assessed months
                            color={month.isAssessed ? '#9CA3AF' : '#111827'} // Gray out assessed
                            />
                        ))}
                    </Picker>
                </View>
                
                {/*  Show loading state */}
                {months.length === 0 && (
                    <ThemedText style={styles.helperText}>
                    Loading months...
                    </ThemedText>
                )}
                
                {months.length > 0 && (
                    <ThemedText style={styles.helperText}>
                    All months up to your selection will be marked as assessed
                    </ThemedText>
                )}
                </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, (submitting || !monthId) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || !monthId}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Record Assessment</ThemedText>
            </>
          )}
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
  childInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.breastfeedLight,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.breastfeed,
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
  instructionList: {
    gap: theme.spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
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
  pickerContainer: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  picker: {
    color: theme.colors.textPrimary,
    backgroundColor: 'transparent',
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
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
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.breastfeed,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});