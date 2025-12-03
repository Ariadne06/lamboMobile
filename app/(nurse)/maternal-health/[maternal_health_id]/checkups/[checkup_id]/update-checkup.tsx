import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
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
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    error: '#EF4444',
    disabled: '#D1D5DB',
    readOnly: '#F3F4F6',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface CheckupRecord {
  checkup_id: number;
  trimester_name: string;
  date_of_checkup: string;
  aog_weeks: number;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  blood_pressure: string | null;
  fetal_heart_rate: number | null;
  laboratory_results: string | null;
  notes: string | null;
}

export default function UpdateCheckupScreen() {
  const { maternal_health_id, checkup_id } = useLocalSearchParams<{
    maternal_health_id: string;
    checkup_id: string;
  }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkupData, setCheckupData] = useState<CheckupRecord | null>(null);
  const [maternalName, setMaternalName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ NEW: Check if 1st trimester (FHR not applicable)
  const isFirstTrimester = checkupData ? checkupData.aog_weeks <= 12 : false;

  // Form data - only midwife fields
  const [formData, setFormData] = useState({
    fetal_heart_rate: '',
    laboratory_results: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [checkup_id]);

  const handleBackPress = () => {
    router.push(`/(nurse)/maternal-health/${maternal_health_id}/checkups` as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (showConfirmModal) {
          setShowConfirmModal(false);
          return true;
        }
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [maternal_health_id, checkup_id, showConfirmModal])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      setUserSession(session);

      // Fetch maternal name
      const maternalResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const maternalData = await maternalResponse.json();
      if (maternalData.success) {
        setMaternalName(maternalData.data.full_name || '');
      }

      // Fetch checkup record
      const checkupResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHECKUP_LIST(parseInt(maternal_health_id))}`
      );
      const checkupListData = await checkupResponse.json();

      if (checkupListData.success) {
        const record = checkupListData.data.find(
          (r: CheckupRecord) => r.checkup_id === parseInt(checkup_id)
        );

        if (record) {
          setCheckupData(record);
          setFormData({
            fetal_heart_rate: record.fetal_heart_rate?.toString() || '',
            laboratory_results: record.laboratory_results || '',
            notes: record.notes || '',
          });
        } else {
          Alert.alert('Error', 'Checkup record not found');
          handleBackPress();
        }
      }
    } catch (error) {
      console.error('❌ Error loading checkup:', error);
      Alert.alert('Error', 'Failed to load checkup data');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // ✅ FHR validation ONLY for 2nd/3rd trimester
    if (!isFirstTrimester) {
      if (formData.fetal_heart_rate) {
        const fhr = parseInt(formData.fetal_heart_rate);
        if (isNaN(fhr) || fhr < 60 || fhr > 200) {
          newErrors.fetal_heart_rate = 'FHR must be between 60-200 bpm';
        }
      }
    }

    // ✅ At least ONE field must be filled
    const hasAnyField =
      (!isFirstTrimester && formData.fetal_heart_rate.trim()) ||
      formData.laboratory_results.trim() ||
      formData.notes.trim();

    if (!hasAnyField) {
      Alert.alert('Required', 'Please fill in at least one field to update');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const submitUpdate = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id;

      if (!personnelId) {
        Alert.alert('Error', 'User session not found. Please log in again.');
        return;
      }

      const payload: any = {
        personnel_id: personnelId,
      };

      // ✅ Only include FHR if NOT 1st trimester
      if (!isFirstTrimester && formData.fetal_heart_rate.trim()) {
        payload.fetal_heart_rate = parseInt(formData.fetal_heart_rate);
      }

      // ✅ Include lab results and notes if provided
      if (formData.laboratory_results.trim()) {
        payload.laboratory_results = formData.laboratory_results.trim();
      }

      if (formData.notes.trim()) {
        payload.notes = formData.notes.trim();
      }

      console.log('📤 Updating checkup:', payload);

      const response = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/checkups/${checkup_id}/update/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log('✅ Response:', data);

      if (response.ok && data.success) {
        Alert.alert('Success', 'Checkup updated successfully!', [
          {
            text: 'OK',
            onPress: () => handleBackPress(),
          },
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to update checkup');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Update Checkup" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading checkup...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!checkupData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Update Checkup" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.errorText}>Checkup not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Update Checkup" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <Ionicons name="woman" size={24} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Complete Midwife Assessment</ThemedText>
          </View>
        </View>
      )}

      {/* Info Notice */}
      <View style={styles.infoNotice}>
        <Ionicons name="information-circle" size={20} color={theme.colors.info} />
        <ThemedText style={styles.infoText}>
          {isFirstTrimester
            ? 'First trimester: FHR not yet detectable. Update lab results and notes.'
            : 'Complete the midwife assessment by adding FHR, lab results, and clinical notes.'}
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* BHW Data (Read-Only) */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="clipboard-outline" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.cardTitle}>BHW Recorded Data (Read-Only)</ThemedText>
            </View>

            <View style={styles.readOnlyGrid}>
              <View style={styles.readOnlyItem}>
                <ThemedText style={styles.readOnlyLabel}>Date of Checkup</ThemedText>
                <ThemedText style={styles.readOnlyValue}>
                  {formatDate(checkupData.date_of_checkup)}
                </ThemedText>
              </View>

              <View style={styles.readOnlyItem}>
                <ThemedText style={styles.readOnlyLabel}>Age of Gestation (AOG)</ThemedText>
                <ThemedText style={styles.readOnlyValue}>{checkupData.aog_weeks} weeks</ThemedText>
                <ThemedText style={styles.trimesterBadge}>{checkupData.trimester_name}</ThemedText>
              </View>

              <View style={styles.readOnlyItem}>
                <ThemedText style={styles.readOnlyLabel}>Weight</ThemedText>
                <ThemedText style={styles.readOnlyValue}>
                  {checkupData.weight_kg ? `${checkupData.weight_kg} kg` : 'N/A'}
                </ThemedText>
              </View>

              <View style={styles.readOnlyItem}>
                <ThemedText style={styles.readOnlyLabel}>Height</ThemedText>
                <ThemedText style={styles.readOnlyValue}>
                  {checkupData.height_cm ? `${checkupData.height_cm} cm` : 'N/A'}
                </ThemedText>
              </View>

              <View style={styles.readOnlyItem}>
                <ThemedText style={styles.readOnlyLabel}>BMI</ThemedText>
                <ThemedText style={styles.readOnlyValue}>
                  {checkupData.bmi ? checkupData.bmi.toFixed(1) : 'N/A'}
                </ThemedText>
              </View>

              <View style={styles.readOnlyItem}>
                <ThemedText style={styles.readOnlyLabel}>Blood Pressure</ThemedText>
                <ThemedText style={styles.readOnlyValue}>
                  {checkupData.blood_pressure || 'N/A'}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* ✅ Midwife Assessment - FHR HIDDEN for 1st Trimester */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="medkit-outline" size={20} color={theme.colors.success} />
              <ThemedText style={styles.cardTitle}>Midwife Clinical Assessment</ThemedText>
            </View>

            {/* ✅ FHR - ONLY for 2nd/3rd Trimester */}
            {!isFirstTrimester && (
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Fetal Heart Rate (FHR) {checkupData.fetal_heart_rate ? '' : ''}
                </ThemedText>
                <TextInput
                  value={formData.fetal_heart_rate}
                  onChangeText={(text) => updateFormData('fetal_heart_rate', text)}
                  placeholder="Enter FHR (60-200 bpm)"
                  keyboardType="numeric"
                  style={[styles.input, errors.fetal_heart_rate && styles.inputError]}
                />
                {errors.fetal_heart_rate && (
                  <ThemedText style={styles.errorText}>{errors.fetal_heart_rate}</ThemedText>
                )}
                <ThemedText style={styles.helperText}>
                  Normal range: 110-160 bpm (Valid: 60-200 bpm)
                </ThemedText>
              </View>
            )}

            {/* Laboratory Results */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Laboratory Results</ThemedText>
              <TextInput
                value={formData.laboratory_results}
                onChangeText={(text) => updateFormData('laboratory_results', text)}
                placeholder="Enter lab results (e.g., CBC: Normal, Urinalysis: Normal)"
                multiline
                numberOfLines={3}
                style={[styles.textArea, errors.laboratory_results && styles.inputError]}
              />
              {errors.laboratory_results && (
                <ThemedText style={styles.errorText}>{errors.laboratory_results}</ThemedText>
              )}
            </View>

            {/* Clinical Notes */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Clinical Notes</ThemedText>
              <TextInput
                value={formData.notes}
                onChangeText={(text) => updateFormData('notes', text)}
                placeholder="Enter clinical observations and recommendations"
                multiline
                numberOfLines={4}
                style={[styles.textArea, errors.notes && styles.inputError]}
              />
              {errors.notes && <ThemedText style={styles.errorText}>{errors.notes}</ThemedText>}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <ThemedText style={styles.submitButtonText}>
            {submitting ? 'Updating...' : 'Update Checkup'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.modalHeader}>
                <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
                <ThemedText style={styles.modalTitle}>Confirm Update</ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  Review your clinical assessment before submitting
                </ThemedText>
              </View>

              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                {/* BHW Data Review */}
                <View style={styles.reviewSection}>
                  <ThemedText style={styles.reviewSectionTitle}>Measurements</ThemedText>
                  <ReviewRow label="Date" value={formatDate(checkupData.date_of_checkup)} />
                  <ReviewRow label="AOG" value={`${checkupData.aog_weeks} weeks`} />
                  <ReviewRow label="Weight" value={checkupData.weight_kg ? `${checkupData.weight_kg} kg` : 'N/A'} />
                  <ReviewRow label="Height" value={checkupData.height_cm ? `${checkupData.height_cm} cm` : 'N/A'} />
                  <ReviewRow label="Blood Pressure" value={checkupData.blood_pressure || 'N/A'} />
                </View>

                {/* Midwife Assessment Review */}
                <View style={styles.reviewSection}>
                  <ThemedText style={styles.reviewSectionTitle}>Your Clinical Assessment</ThemedText>
                  {!isFirstTrimester && (
                    <ReviewRow
                      label="FHR"
                      value={formData.fetal_heart_rate ? `${formData.fetal_heart_rate} bpm` : 'Not provided'}
                    />
                  )}
                  <ReviewRow
                    label="Lab Results"
                    value={formData.laboratory_results.trim() || 'Not provided'}
                  />
                  <ReviewRow label="Notes" value={formData.notes.trim() || 'Not provided'} />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
                  <ThemedText style={styles.modalButtonSecondaryText}>Go Back</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButtonPrimary, submitting && styles.modalButtonDisabled]}
                  onPress={submitUpdate}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                      <ThemedText style={styles.modalButtonPrimaryText}>Submit</ThemedText>
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

// Review Row Component
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
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
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
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.infoLight,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.info,
    lineHeight: 16,
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
  readOnlyGrid: {
    gap: theme.spacing.md,
  },
  readOnlyItem: {
    backgroundColor: theme.colors.readOnly,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  readOnlyLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  readOnlyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  trimesterBadge: {
    fontSize: 11,
    color: theme.colors.info,
    backgroundColor: theme.colors.infoLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-start',
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
  textArea: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    fontSize: 15,
    color: theme.colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.error,
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
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});