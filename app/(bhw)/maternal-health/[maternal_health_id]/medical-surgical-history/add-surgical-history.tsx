import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#F59E0B',
    primaryLight: '#FFF3CD',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    error: '#EF4444',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function AddSurgicalHistoryScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [maternalName, setMaternalName] = useState('');
  
  const [surgicalHistory, setSurgicalHistory] = useState('');
  const [dateOfSurgery, setDateOfSurgery] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/medical-surgical-history` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
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
      const session = await getUserSession();
      setUserSession(session);

      const response = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const data = await response.json();

      if (data.success) {
        setMaternalName(data.data.full_name || '');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load maternal information');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfSurgery(selectedDate);
      setErrors({ ...errors, dateOfSurgery: '' });
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!surgicalHistory.trim()) {
      newErrors.surgicalHistory = 'Surgical history is required';
    } else if (surgicalHistory.trim().length < 3) {
      newErrors.surgicalHistory = 'Must be at least 3 characters';
    } else if (surgicalHistory.trim().length > 500) {
      newErrors.surgicalHistory = 'Must be less than 500 characters';
    }

    if (!dateOfSurgery) {
      newErrors.dateOfSurgery = 'Date of surgery is required';
    } else if (dateOfSurgery > new Date()) {
      newErrors.dateOfSurgery = 'Cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all fields');
      return;
    }

    Alert.alert(
      'Confirm',
      `Add surgical history?\n\n"${surgicalHistory.trim()}"\nDate: ${formatDate(dateOfSurgery)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: submitRecord }
      ]
    );
  };

  const submitRecord = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      const payload = {
        personnel_id: personnelId,
        surgical_history_name: surgicalHistory.trim(),
        date_of_surgery: dateOfSurgery?.toISOString().split('T')[0],
      };

      console.log('📤 Submitting surgical history:', payload);

      const response = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/surgical-history/add/`,
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
          'Surgical history added successfully',
          [
            {
              text: 'Add Another',
              onPress: () => {
                setSurgicalHistory('');
                setDateOfSurgery(null);
                setErrors({});
              }
            },
            {
              text: 'View Records',
              onPress: () => handleBackPress(),
              style: 'default'
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to add surgical history');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Surgical History" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Surgical History" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <Ionicons name="woman" size={24} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Add Surgical History</ThemedText>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.primaryLight }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.infoTitle}>Surgical History Information</ThemedText>
          </View>
          <ThemedText style={styles.infoText}>
            Record any previous surgeries or operations that the mother has undergone.
          </ThemedText>
          <ThemedText style={styles.infoExample}>
            Examples: Cesarean Section, Appendectomy, Cholecystectomy, Hysterectomy, etc.
          </ThemedText>
        </View>

        {/* Surgical History Form */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cut" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Surgical Details</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Surgical History Name *</ThemedText>
            <TextInput
              style={[styles.textArea, errors.surgicalHistory && styles.inputError]}
              value={surgicalHistory}
              onChangeText={(text) => {
                setSurgicalHistory(text);
                setErrors({ ...errors, surgicalHistory: '' });
              }}
              placeholder="Enter surgery/operation name (e.g., Previous C-Section)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={500}
            />
            {errors.surgicalHistory ? (
              <ThemedText style={styles.errorText}>{errors.surgicalHistory}</ThemedText>
            ) : (
              <ThemedText style={styles.helperText}>
                {surgicalHistory.length}/500 characters
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Date of Surgery *</ThemedText>
            <TouchableOpacity
              style={[styles.dateButton, errors.dateOfSurgery && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={[
                styles.dateButtonText,
                !dateOfSurgery && styles.placeholderText
              ]}>
                {formatDate(dateOfSurgery)}
              </ThemedText>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {errors.dateOfSurgery && (
              <ThemedText style={styles.errorText}>{errors.dateOfSurgery}</ThemedText>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfSurgery || new Date()}
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
        >
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <ThemedText style={styles.submitButtonText}>
            {submitting ? 'Adding...' : 'Add Surgical History'}
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  infoExample: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
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
  textArea: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    fontSize: 15,
    color: theme.colors.textPrimary,
    minHeight: 100,
  },
  inputError: {
    borderColor: theme.colors.error,
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
  placeholderText: {
    color: theme.colors.textMuted,
    fontWeight: '400',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
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
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});