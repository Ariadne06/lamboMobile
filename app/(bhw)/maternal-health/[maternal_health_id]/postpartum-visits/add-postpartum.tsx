import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
  TextInput,
  Platform,
  Modal,
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
    primary: '#EC4899',
    primaryLight: '#FDF2F8',
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

export default function AddPostpartumVisitScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [maternalName, setMaternalName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form state
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    weight_kg: '',
    height_cm: '',
    blood_pressure: '',
    laboratory_notes: '',
    notes: '',
  });

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    if (showConfirmModal) {
      setShowConfirmModal(false);
      return;
    }
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/postpartum-visits` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [maternal_health_id, showConfirmModal])
  );

  const loadData = async () => {
    try {
      const session = await getUserSession();
      if (!session) {
        Alert.alert('Error', 'Session expired. Please login again.');
        router.push('/(auth)/login');
        return;
      }
      setUserSession(session);

      // Fetch maternal health record to get name
      const response = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );

      const data = await response.json();
      if (data.success && data.data) {
        setMaternalName(data.data.full_name || 'Unknown');
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Error', 'Failed to load maternal information');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setVisitDate(selectedDate);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Optional fields - just validate format if provided
    if (formData.weight_kg && (parseFloat(formData.weight_kg) <= 0 || parseFloat(formData.weight_kg) > 200)) {
      newErrors.weight_kg = 'Weight must be between 0 and 200 kg';
    }

    if (formData.height_cm && (parseFloat(formData.height_cm) <= 0 || parseFloat(formData.height_cm) > 250)) {
      newErrors.height_cm = 'Height must be between 0 and 250 cm';
    }

    if (formData.blood_pressure.trim()) {
        const bpPattern = /^\d{2,3}\/\d{2,3}$/;
        if (!bpPattern.test(formData.blood_pressure.trim())) {
        newErrors.blood_pressure = 'Format should be: 120/80';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setVisitDate(new Date());
    setFormData({
      weight_kg: '',
      height_cm: '',
      blood_pressure: '',
      laboratory_notes: '',
      notes: '',
    });
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors before submitting.');
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const submitRecord = async () => {
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const payload = {
        date_of_visit: visitDate.toISOString().split('T')[0], // YYYY-MM-DD
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        blood_pressure: formData.blood_pressure.trim() || null,
        laboratory_notes: formData.laboratory_notes.trim() || null,
        notes: formData.notes.trim() || null,
        personnel_id: userSession.user_id,
      };

      console.log('📤 Submitting payload:', payload);

      const response = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/postpartum/add/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log('📥 Server response:', data);

      if (data.success) {
        clearForm(); // ✅ Clear form after successful submission
        
        Alert.alert(
          'Success',
          'Postpartum visit recorded successfully!',
          [
            {
              text: 'Add Another',
              onPress: () => {
                // Form is already cleared, just stay on page
              }
            },
            {
              text: 'View Records',
              onPress: () => router.push(`/(bhw)/maternal-health/${maternal_health_id}/postpartum-visits` as any)
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to record postpartum visit');
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      Alert.alert('Error', 'Failed to submit. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Postpartum Visit" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Postpartum Visit" onBackPress={handleBackPress} />

      {/* Maternal Info Banner */}
      <View style={styles.bannerCard}>
        <Ionicons name="heart-circle" size={28} color={theme.colors.primary} />
        <View style={styles.bannerInfo}>
          <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
          <ThemedText style={styles.bannerSubtext}>Postpartum Follow-up</ThemedText>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Visit Date Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Visit Information</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Date of Visit *</ThemedText>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={styles.dateButtonText}>{formatDate(visitDate)}</ThemedText>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={visitDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Vital Signs Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="fitness" size={20} color={theme.colors.success} />
            <ThemedText style={styles.cardTitle}>Vital Signs (Optional)</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Weight (kg)</ThemedText>
            <TextInput
              style={[styles.input, errors.weight_kg && styles.inputError]}
              placeholder="e.g., 65.5"
              keyboardType="decimal-pad"
              value={formData.weight_kg}
              onChangeText={(text) => updateFormData('weight_kg', text)}
            />
            {errors.weight_kg && (
              <ThemedText style={styles.errorText}>{errors.weight_kg}</ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Height (cm)</ThemedText>
            <TextInput
              style={[styles.input, errors.height_cm && styles.inputError]}
              placeholder="e.g., 160"
              keyboardType="decimal-pad"
              value={formData.height_cm}
              onChangeText={(text) => updateFormData('height_cm', text)}
            />
            {errors.height_cm && (
              <ThemedText style={styles.errorText}>{errors.height_cm}</ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Blood Pressure</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="e.g., 120/80"
              value={formData.blood_pressure}
              onChangeText={(text) => updateFormData('blood_pressure', text)}
            />
          </View>
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Additional Information</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Laboratory Result</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Lab test results, findings..."
              multiline
              numberOfLines={3}
              value={formData.laboratory_notes}
              onChangeText={(text) => updateFormData('laboratory_notes', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Notes</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Assessment Findings, Risk Assessment, FP Counselling, etc."
              multiline
              numberOfLines={4}
              value={formData.notes}
              onChangeText={(text) => updateFormData('notes', text)}
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
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Review & Submit</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ✅ Centered Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Ionicons name="close-circle" size={28} color={theme.colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.modalHeader}>
                <Ionicons name="clipboard-outline" size={32} color={theme.colors.primary} />
                <ThemedText style={styles.modalTitle}>Review Postpartum Visit</ThemedText>
                <ThemedText style={styles.modalSubtitle}>Please verify all information before submitting</ThemedText>
              </View>

              <ScrollView 
                style={styles.modalScroll}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.reviewSection}>
                  <ThemedText style={styles.reviewSectionTitle}>📅 Visit Information</ThemedText>
                  <ReviewRow label="Date of Visit" value={formatDate(visitDate)} />
                </View>

                <View style={styles.reviewSection}>
                  <ThemedText style={styles.reviewSectionTitle}>💪 Vital Signs</ThemedText>
                  <ReviewRow label="Weight" value={formData.weight_kg ? `${formData.weight_kg} kg` : 'Not provided'} />
                  <ReviewRow label="Height" value={formData.height_cm ? `${formData.height_cm} cm` : 'Not provided'} />
                  <ReviewRow label="Blood Pressure" value={formData.blood_pressure || 'Not provided'} />
                </View>

                {(formData.laboratory_notes || formData.notes) && (
                  <View style={styles.reviewSection}>
                    <ThemedText style={styles.reviewSectionTitle}>📝 Additional Information</ThemedText>
                    
                    {formData.laboratory_notes && (
                      <View style={styles.notesReview}>
                        <ThemedText style={styles.notesReviewLabel}>🔬 Laboratory Results:</ThemedText>
                        <ThemedText style={styles.notesReviewText}>{formData.laboratory_notes}</ThemedText>
                      </View>
                    )}

                    {formData.notes && (
                      <View style={styles.notesReview}>
                        <ThemedText style={styles.notesReviewLabel}>📋 Notes:</ThemedText>
                        <ThemedText style={styles.notesReviewText}>{formData.notes}</ThemedText>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                  <ThemedText style={styles.modalButtonSecondaryText}>Edit</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButtonPrimary}
                  onPress={submitRecord}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      <ThemedText style={styles.modalButtonPrimaryText}>Confirm</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.reviewRow}>
    <ThemedText style={styles.reviewLabel}>{label}:</ThemedText>
    <ThemedText style={styles.reviewValue}>{value}</ThemedText>
  </View>
);

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
    backgroundColor: theme.colors.success,
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
  // ✅ Centered Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 10,
    padding: theme.spacing.xs,
  },
  modalHeader: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  reviewSection: {
    marginTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reviewSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  reviewLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1.2,
    textAlign: 'right',
  },
  notesReview: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
  },
  notesReviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  notesReviewText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  modalButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalButtonSecondaryText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  modalButtonPrimary: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});