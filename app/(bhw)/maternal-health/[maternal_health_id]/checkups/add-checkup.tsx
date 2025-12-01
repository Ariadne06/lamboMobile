import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Platform,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    error: '#EF4444',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function AddCheckupScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [maternalName, setMaternalName] = useState('');

  // Form state
  const [checkupDate, setCheckupDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    aog_weeks: '',
    weight_kg: '',
    height_cm: '',
    bmi: '',
    blood_pressure: '',
    fetal_heart_rate: '',
    laboratory_results: '',
    notes: '',
  });

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/checkups` as any);
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

      // Get maternal name
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
      setCheckupDate(selectedDate);
      setErrors({ ...errors, checkupDate: '' });
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Auto-calculate BMI when weight or height changes
    if (field === 'weight_kg' || field === 'height_cm') {
      const weight = field === 'weight_kg' ? parseFloat(value) : parseFloat(formData.weight_kg);
      const height = field === 'height_cm' ? parseFloat(value) : parseFloat(formData.height_cm);
      
      if (weight > 0 && height > 0) {
        const bmi = weight / Math.pow(height / 100, 2);
        setFormData(prev => ({ ...prev, bmi: bmi.toFixed(1) }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // AOG validation
    if (!formData.aog_weeks.trim()) {
      newErrors.aog_weeks = 'AOG (weeks) is required';
    } else {
      const weeks = parseInt(formData.aog_weeks);
      if (isNaN(weeks) || weeks < 0 || weeks > 42) {
        newErrors.aog_weeks = 'AOG must be between 0-42 weeks';
      }
    }

    // Weight validation
    if (!formData.weight_kg.trim()) {
      newErrors.weight_kg = 'Weight is required';
    } else if (parseFloat(formData.weight_kg) <= 0) {
      newErrors.weight_kg = 'Weight must be greater than 0';
    }

    // Height validation
    if (!formData.height_cm.trim()) {
      newErrors.height_cm = 'Height is required';
    } else if (parseFloat(formData.height_cm) <= 0) {
      newErrors.height_cm = 'Height must be greater than 0';
    }

    // Fetal heart rate validation (optional, but must be > 0 if provided)
    if (formData.fetal_heart_rate.trim()) {
      const fhr = parseInt(formData.fetal_heart_rate);
      if (isNaN(fhr) || fhr <= 0) {
        newErrors.fetal_heart_rate = 'Must be a valid positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all required fields');
      return;
    }

    Alert.alert(
      'Confirm',
      'Add prenatal checkup record?',
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
        aog_weeks: parseInt(formData.aog_weeks),
        weight_kg: parseFloat(formData.weight_kg),
        height_cm: parseFloat(formData.height_cm),
        bmi: formData.bmi ? parseFloat(formData.bmi) : null,
        blood_pressure: formData.blood_pressure.trim() || null,
        fetal_heart_rate: formData.fetal_heart_rate.trim() ? parseInt(formData.fetal_heart_rate) : null,
        laboratory_results: formData.laboratory_results.trim() || null,
        notes: formData.notes.trim() || null,
      };

      console.log('📤 Submitting checkup:', payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHECKUP_ADD(parseInt(maternal_health_id))}`,
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
          'Prenatal checkup added successfully!',
          [
            {
              text: 'View Records',
              onPress: () => handleBackPress(),
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to add checkup');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Prenatal Checkup" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Prenatal Checkup" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <Ionicons name="woman" size={24} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Add Prenatal Checkup</ThemedText>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Date Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Checkup Date</ThemedText>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText style={styles.dateButtonText}>{formatDate(checkupDate)}</ThemedText>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={checkupDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* AOG & Vital Signs Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="fitness" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Vital Measurements</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>AOG (Weeks) *</ThemedText>
            <TextInput
              style={[styles.input, errors.aog_weeks && styles.inputError]}
              value={formData.aog_weeks}
              onChangeText={(text) => updateFormData('aog_weeks', text)}
              placeholder="e.g., 16"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textMuted}
            />
            {errors.aog_weeks && (
              <ThemedText style={styles.errorText}>{errors.aog_weeks}</ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Weight (kg) *</ThemedText>
            <TextInput
              style={[styles.input, errors.weight_kg && styles.inputError]}
              value={formData.weight_kg}
              onChangeText={(text) => updateFormData('weight_kg', text)}
              placeholder="e.g., 58.5"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.textMuted}
            />
            {errors.weight_kg && (
              <ThemedText style={styles.errorText}>{errors.weight_kg}</ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Height (cm) *</ThemedText>
            <TextInput
              style={[styles.input, errors.height_cm && styles.inputError]}
              value={formData.height_cm}
              onChangeText={(text) => updateFormData('height_cm', text)}
              placeholder="e.g., 160"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.textMuted}
            />
            {errors.height_cm && (
              <ThemedText style={styles.errorText}>{errors.height_cm}</ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>BMI (Auto-calculated)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: '#F3F4F6' }]}
              value={formData.bmi}
              editable={false}
              placeholder="Auto-calculated"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Blood Pressure</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.blood_pressure}
              onChangeText={(text) => updateFormData('blood_pressure', text)}
              placeholder="e.g., 120/80"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Fetal Heart Rate (bpm)</ThemedText>
            <TextInput
              style={[styles.input, errors.fetal_heart_rate && styles.inputError]}
              value={formData.fetal_heart_rate}
              onChangeText={(text) => updateFormData('fetal_heart_rate', text)}
              placeholder="e.g., 140"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textMuted}
            />
            {errors.fetal_heart_rate && (
              <ThemedText style={styles.errorText}>{errors.fetal_heart_rate}</ThemedText>
            )}
          </View>
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Assessment & Notes</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Laboratory Results</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.laboratory_results}
              onChangeText={(text) => updateFormData('laboratory_results', text)}
              placeholder="Enter lab results (CBC, OGTT, etc.)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Notes (Assessment, Counseling)</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => updateFormData('notes', text)}
              placeholder="Enter assessment findings, risk assessment, counseling notes..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
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
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Add Checkup Record</ThemedText>
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
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
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