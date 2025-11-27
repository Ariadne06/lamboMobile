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
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFF3CD',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface VaccineType {
  vaccine_type_id: number;
  vaccine_name: string;
  at_birth: boolean;
}

interface DoseType {
  dose_type_id: number;
  dose_name: string;
}

// ✅ Interface for current immunization status
interface ImmunizationStatus {
  vaccine_type_id: number;
  at_birth_given: boolean;
  first_dose_given: boolean;
  second_dose_given: boolean;
  third_dose_given: boolean;
}

export default function NurseAddImmunizationScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(null);

  const [vaccines, setVaccines] = useState<VaccineType[]>([]);
  const [doses, setDoses] = useState<DoseType[]>([]);
  
  // ✅ Track current immunization status
  const [immunizationStatus, setImmunizationStatus] = useState<ImmunizationStatus[]>([]);

  const [formData, setFormData] = useState({
    vaccine_type_id: null as number | null,
    dose_type_id: null as number | null,
  });

  useEffect(() => {
    loadData();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(nurse)/child-health/${child_health_id}/immunization` as any);
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

      // ✅ 1. Get child info
      console.log('🔍 Loading child info...');
      const childResponse = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/`
      );
      
      if (!childResponse.ok) {
        throw new Error(`Child info request failed: ${childResponse.status}`);
      }
      
      const childData = await childResponse.json();
      console.log('✅ Child data:', childData);

      if (childData.success) {
        setChildInfo(childData.data);
      } else {
        throw new Error(childData.error || 'Failed to load child info');
      }

      // ✅ 2. Get current immunization status
      console.log('🔍 Loading immunization status...');
      const statusResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_LIST(parseInt(child_health_id))}`
      );
      
      if (!statusResponse.ok) {
        throw new Error(`Status request failed: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      console.log('✅ Immunization status:', statusData);
      
      if (statusData.success) {
        setImmunizationStatus(statusData.data || []);
      }

      // ✅ 3. Get vaccine types
      console.log('🔍 Loading vaccine types...');
      const vaccinesResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VACCINE_TYPES}`);
      
      if (!vaccinesResponse.ok) {
        throw new Error(`Vaccines request failed: ${vaccinesResponse.status}`);
      }
      
      const vaccinesData = await vaccinesResponse.json();
      console.log('✅ Vaccines:', vaccinesData);
      
      // Handle different response formats
      if (Array.isArray(vaccinesData)) {
        setVaccines(vaccinesData);
      } else if (vaccinesData.results) {
        setVaccines(vaccinesData.results);
      } else {
        setVaccines([]);
      }

      // ✅ 4. Get dose types
      console.log('🔍 Loading dose types...');
      const dosesResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOSE_TYPES}`);
      
      if (!dosesResponse.ok) {
        throw new Error(`Doses request failed: ${dosesResponse.status}`);
      }
      
      const dosesData = await dosesResponse.json();
      console.log('✅ Doses:', dosesData);
      
      // Handle different response formats
      if (Array.isArray(dosesData)) {
        setDoses(dosesData);
      } else if (dosesData.results) {
        setDoses(dosesData.results);
      } else {
        setDoses([]);
      }

    } catch (error) {
      console.error('❌ Failed to load data:', error);
      Alert.alert(
        'Error', 
        `Failed to load immunization data: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your internet connection and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Get available doses for selected vaccine
  const getAvailableDoses = (vaccineTypeId: number | null): DoseType[] => {
    if (!vaccineTypeId) return [];

    const selectedVaccine = vaccines.find(v => v.vaccine_type_id === vaccineTypeId);
    const status = immunizationStatus.find(s => s.vaccine_type_id === vaccineTypeId);

    if (!selectedVaccine || !status) return doses; // Show all if no history

    const availableDoses: DoseType[] = [];

    // ✅ DOSE SEQUENCE LOGIC (matches backend)
    // At Birth -> 1st Dose -> 2nd Dose -> 3rd Dose

    // If vaccine has "at_birth" dose
    if (selectedVaccine.at_birth) {
      if (!status.at_birth_given) {
        // Must give "At Birth" first
        const atBirthDose = doses.find(d => d.dose_name.toLowerCase().includes('at birth'));
        if (atBirthDose) availableDoses.push(atBirthDose);
      } else if (!status.first_dose_given) {
        // After "At Birth", can give 1st Dose
        const firstDose = doses.find(d => d.dose_name.toLowerCase().includes('1st'));
        if (firstDose) availableDoses.push(firstDose);
      } else if (!status.second_dose_given) {
        // After 1st Dose, can give 2nd Dose
        const secondDose = doses.find(d => d.dose_name.toLowerCase().includes('2nd'));
        if (secondDose) availableDoses.push(secondDose);
      } else if (!status.third_dose_given) {
        // After 2nd Dose, can give 3rd Dose
        const thirdDose = doses.find(d => d.dose_name.toLowerCase().includes('3rd'));
        if (thirdDose) availableDoses.push(thirdDose);
      }
    } else {
      // Vaccine WITHOUT "at_birth" dose
      if (!status.first_dose_given) {
        const firstDose = doses.find(d => d.dose_name.toLowerCase().includes('1st'));
        if (firstDose) availableDoses.push(firstDose);
      } else if (!status.second_dose_given) {
        const secondDose = doses.find(d => d.dose_name.toLowerCase().includes('2nd'));
        if (secondDose) availableDoses.push(secondDose);
      } else if (!status.third_dose_given) {
        const thirdDose = doses.find(d => d.dose_name.toLowerCase().includes('3rd'));
        if (thirdDose) availableDoses.push(thirdDose);
      }
    }

    return availableDoses;
  };

  const validateForm = () => {
    if (!formData.vaccine_type_id) {
      Alert.alert('Required', 'Please select a vaccine type');
      return false;
    }

    if (!formData.dose_type_id) {
      Alert.alert('Required', 'Please select a dose');
      return false;
    }

    // ✅ Check if dose is valid for vaccine
    const availableDoses = getAvailableDoses(formData.vaccine_type_id);
    const isValidDose = availableDoses.some(d => d.dose_type_id === formData.dose_type_id);

    if (!isValidDose) {
      Alert.alert('Invalid Dose', 'This dose cannot be administered yet. Please follow the correct sequence.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const selectedVaccine = vaccines.find(v => v.vaccine_type_id === formData.vaccine_type_id);
    const selectedDose = doses.find(d => d.dose_type_id === formData.dose_type_id);

    Alert.alert(
      'Confirm',
      `Administer ${selectedVaccine?.vaccine_name} - ${selectedDose?.dose_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Record', onPress: submitImmunization }
      ]
    );
  };

  const submitImmunization = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      const payload = {
        personnel_id: personnelId,
        vaccine_type_id: formData.vaccine_type_id,
        dose_type_id: formData.dose_type_id,
      };

      console.log('📤 Submitting immunization:', payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_ADD(parseInt(child_health_id))}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log('📥 Server response:', data);

      if (response.ok && data.success) {
        Alert.alert(
          'Success',
          'Immunization recorded successfully',
          [
            {
              text: 'Add Another',
              onPress: () => {
                setFormData({ vaccine_type_id: null, dose_type_id: null });
                loadData(); // Reload to get updated status
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
        // ✅ Show backend error (e.g., "Invalid dose order")
        Alert.alert('Error', data.error || 'Failed to record immunization');
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
        <CustomHeader title="Add Immunization" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const availableDoses = getAvailableDoses(formData.vaccine_type_id);
  const selectedVaccine = vaccines.find(v => v.vaccine_type_id === formData.vaccine_type_id);
  const vaccineStatus = immunizationStatus.find(s => s.vaccine_type_id === formData.vaccine_type_id);

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Immunization" onBackPress={handleBackPress} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Child Info Card */}
        <View style={styles.childInfoCard}>
          <Ionicons name="medical" size={24} color={theme.colors.primary} />
          <View style={styles.childInfo}>
            <ThemedText style={styles.childName}>{childInfo?.child_full_name}</ThemedText>
            <ThemedText style={styles.childSubtext}>Recording immunization for this child</ThemedText>
          </View>
        </View>

        {/* Instructions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Instructions</ThemedText>
          </View>
          <View style={styles.instructionList}>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <ThemedText style={styles.instructionText}>
                Select the vaccine type you are administering
              </ThemedText>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <ThemedText style={styles.instructionText}>
                Only valid doses will be shown (backend enforces sequence)
              </ThemedText>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <ThemedText style={styles.instructionText}>
                Record will be timestamped automatically
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Immunization Details</ThemedText>
          </View>

          {/* Vaccine Type */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Vaccine Type *</ThemedText>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.vaccine_type_id}
                onValueChange={(value) => {
                  updateFormData('vaccine_type_id', value);
                  updateFormData('dose_type_id', null); // Reset dose when vaccine changes
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select vaccine..." value={null} />
                {vaccines.map((vaccine) => (
                  <Picker.Item
                    key={vaccine.vaccine_type_id}
                    label={vaccine.vaccine_name}
                    value={vaccine.vaccine_type_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* ✅ Show Current Status */}
          {formData.vaccine_type_id && vaccineStatus && (
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Ionicons name="clipboard" size={16} color={theme.colors.textSecondary} />
                <ThemedText style={styles.statusTitle}>Current Status for {selectedVaccine?.vaccine_name}</ThemedText>
              </View>
              <View style={styles.statusList}>
                {selectedVaccine?.at_birth && (
                  <View style={styles.statusItem}>
                    <Ionicons 
                      name={vaccineStatus.at_birth_given ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={vaccineStatus.at_birth_given ? theme.colors.success : theme.colors.textMuted} 
                    />
                    <ThemedText style={styles.statusItemText}>At Birth</ThemedText>
                  </View>
                )}
                <View style={styles.statusItem}>
                  <Ionicons 
                    name={vaccineStatus.first_dose_given ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={vaccineStatus.first_dose_given ? theme.colors.success : theme.colors.textMuted} 
                  />
                  <ThemedText style={styles.statusItemText}>1st Dose</ThemedText>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons 
                    name={vaccineStatus.second_dose_given ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={vaccineStatus.second_dose_given ? theme.colors.success : theme.colors.textMuted} 
                  />
                  <ThemedText style={styles.statusItemText}>2nd Dose</ThemedText>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons 
                    name={vaccineStatus.third_dose_given ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={vaccineStatus.third_dose_given ? theme.colors.success : theme.colors.textMuted} 
                  />
                  <ThemedText style={styles.statusItemText}>3rd Dose</ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Dose Type - Only show AVAILABLE doses */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Dose *</ThemedText>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.dose_type_id}
                onValueChange={(value) => updateFormData('dose_type_id', value)}
                style={styles.picker}
                enabled={!!formData.vaccine_type_id}
              >
                <Picker.Item 
                  label={
                    !formData.vaccine_type_id 
                      ? "Select vaccine first..." 
                      : availableDoses.length === 0 
                        ? "All doses completed" 
                        : "Select dose..."
                  } 
                  value={null} 
                />
                {availableDoses.map((dose) => (
                  <Picker.Item
                    key={dose.dose_type_id}
                    label={dose.dose_name}
                    value={dose.dose_type_id}
                  />
                ))}
              </Picker>
            </View>
            {formData.vaccine_type_id && availableDoses.length === 0 && (
              <View style={styles.completedNotice}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <ThemedText style={styles.completedText}>
                  All doses for this vaccine have been completed
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <PrimaryButton
          title={submitting ? 'Recording...' : 'Record Immunization'}
          onPress={handleSubmit}
          disabled={submitting || !formData.vaccine_type_id || !formData.dose_type_id}
          icon={submitting ? undefined : 'medical'}
          style={submitting && styles.submitButtonDisabled}
        />
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
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
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
  statusCard: {
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  statusList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusItemText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  completedText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
});