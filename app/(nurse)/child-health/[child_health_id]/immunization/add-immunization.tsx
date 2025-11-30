import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
    primarySoft: '#DBEAFE',
    primaryDeep: '#1D4ED8',
    danger: '#DC2626',
    success: '#10B981',
    successSoft: '#D1FAE5',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 },
};

interface VaccineType {
  vaccine_type_id: number;
  vaccine_name: string;
  at_birth: boolean; // DB flag
}

interface DoseType {
  dose_type_id: number;
  dose_name: string; // 'At Birth', 'First Dose', 'Second Dose', 'Third Dose'
}

interface ImmunizationStatus {
  vaccine_type_id: number;
  at_birth_given: boolean;
  first_dose_given: boolean;
  second_dose_given: boolean;
  third_dose_given: boolean;
}

type FormData = {
  vaccine_type_id: number | null;
  dose_type_id: number | null;
};

export default function NurseAddImmunizationScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(null);

  const [vaccines, setVaccines] = useState<VaccineType[]>([]);
  const [doses, setDoses] = useState<DoseType[]>([]);
  const [immunizationStatus, setImmunizationStatus] = useState<ImmunizationStatus[]>([]);

  const [formData, setFormData] = useState<FormData>({
    vaccine_type_id: null,
    dose_type_id: null,
  });

  const handleBackPress = () => {
    router.push(`/(nurse)/child-health/${child_health_id}/immunization` as any);
  };

  // 🔁 Reload data when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          setLoading(true);
          const session = await getUserSession();
          if (!isActive) return;
          setUserSession(session);

          // 1) Child info
          const childResponse = await fetch(
            `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/`
          );
          if (!childResponse.ok) {
            throw new Error(`Child info request failed: ${childResponse.status}`);
          }
          const childData = await childResponse.json();
          if (!isActive) return;
          if (childData.success) {
            setChildInfo(childData.data);
          } else {
            throw new Error(childData.error || 'Failed to load child info');
          }

          // 2) Immunization status
          const statusResponse = await fetch(
            `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_LIST(
              parseInt(child_health_id as string, 10)
            )}`
          );
          if (!statusResponse.ok) {
            throw new Error(`Status request failed: ${statusResponse.status}`);
          }
          const statusData = await statusResponse.json();
          if (!isActive) return;
          if (statusData.success) {
            setImmunizationStatus(statusData.data || []);
          }

          // 3) Vaccine types
          const vaccinesResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VACCINE_TYPES}`);
          if (!vaccinesResponse.ok) {
            throw new Error(`Vaccines request failed: ${vaccinesResponse.status}`);
          }
          const vaccinesData = await vaccinesResponse.json();
          if (!isActive) return;
          if (Array.isArray(vaccinesData)) {
            setVaccines(vaccinesData);
          } else if (vaccinesData.results) {
            setVaccines(vaccinesData.results);
          } else {
            setVaccines([]);
          }

          // 4) Dose types
          const dosesResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOSE_TYPES}`);
          if (!dosesResponse.ok) {
            throw new Error(`Doses request failed: ${dosesResponse.status}`);
          }
          const dosesData = await dosesResponse.json();
          if (!isActive) return;
          if (Array.isArray(dosesData)) {
            setDoses(dosesData);
          } else if (dosesData.results) {
            setDoses(dosesData.results);
          } else {
            setDoses([]);
          }
        } catch (error) {
          console.error('❌ Failed to load data:', error);
          if (isActive) {
            Alert.alert(
              'Error',
              `Failed to load immunization data: ${
                error instanceof Error ? error.message : 'Unknown error'
              }\n\nPlease check your internet connection and try again.`
            );
          }
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadData();

      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        isActive = false;
        backHandler.remove();
      };
    }, [child_health_id])
  );

  const updateFormData = (field: keyof FormData, value: number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Rules:
   * - BCG: At Birth only
   * - Hepatitis B: At Birth only
   * - Pentavalent: 1st / 2nd / 3rd only (no At Birth)
   * - Others:
   *   * at_birth = true → At Birth → 1st → 2nd → 3rd
   *   * at_birth = false → 1st → 2nd → 3rd
   */
  const getAvailableDoses = (vaccineTypeId: number | null): DoseType[] => {
    if (!vaccineTypeId) return [];

    const selectedVaccine = vaccines.find(v => v.vaccine_type_id === vaccineTypeId);
    if (!selectedVaccine) return [];

    const status = immunizationStatus.find(s => s.vaccine_type_id === vaccineTypeId);

    const effectiveStatus: ImmunizationStatus = status || {
      vaccine_type_id: vaccineTypeId,
      at_birth_given: false,
      first_dose_given: false,
      second_dose_given: false,
      third_dose_given: false,
    };

    const findDose = (doseName: string) =>
      doses.find(d => d.dose_name.toLowerCase() === doseName.toLowerCase());

    const nameLower = selectedVaccine.vaccine_name.toLowerCase();
    const isBCG = nameLower.includes('bcg');
    const isHepaB =
      nameLower.includes('hepa') ||
      nameLower.includes('hepatitis b') ||
      nameLower.includes('hep b');
    const isAtBirthOnly = isBCG || isHepaB;
    const isPenta = nameLower.includes('pentavalent') || nameLower.includes('penta');

    const available: DoseType[] = [];

    // BCG & Hepa B: At Birth ONLY
    if (isAtBirthOnly) {
      if (!effectiveStatus.at_birth_given) {
        const atBirth = findDose('At Birth');
        if (atBirth) available.push(atBirth);
      }
      return available;
    }

    // Pentavalent: 1st, 2nd, 3rd only
    if (isPenta) {
      if (!effectiveStatus.first_dose_given) {
        const first = findDose('First Dose');
        if (first) available.push(first);
      } else if (!effectiveStatus.second_dose_given) {
        const second = findDose('Second Dose');
        if (second) available.push(second);
      } else if (!effectiveStatus.third_dose_given) {
        const third = findDose('Third Dose');
        if (third) available.push(third);
      }
      return available;
    }

    // Other vaccines
    if (selectedVaccine.at_birth) {
      if (!effectiveStatus.at_birth_given) {
        const atBirth = findDose('At Birth');
        if (atBirth) available.push(atBirth);
      } else if (!effectiveStatus.first_dose_given) {
        const first = findDose('First Dose');
        if (first) available.push(first);
      } else if (!effectiveStatus.second_dose_given) {
        const second = findDose('Second Dose');
        if (second) available.push(second);
      } else if (!effectiveStatus.third_dose_given) {
        const third = findDose('Third Dose');
        if (third) available.push(third);
      }
    } else {
      if (!effectiveStatus.first_dose_given) {
        const first = findDose('First Dose');
        if (first) available.push(first);
      } else if (!effectiveStatus.second_dose_given) {
        const second = findDose('Second Dose');
        if (second) available.push(second);
      } else if (!effectiveStatus.third_dose_given) {
        const third = findDose('Third Dose');
        if (third) available.push(third);
      }
    }

    return available;
  };

  /**
   * A vaccine is "completed" when:
   * - At least one dose has been given, AND
   * - There are no more available doses according to getAvailableDoses().
   */
  const isVaccineCompleted = (vaccineTypeId: number): boolean => {
    const status = immunizationStatus.find(s => s.vaccine_type_id === vaccineTypeId);
    const hasAnyDoseGiven = status
      ? status.at_birth_given ||
        status.first_dose_given ||
        status.second_dose_given ||
        status.third_dose_given
      : false;

    if (!hasAnyDoseGiven) return false;

    const remaining = getAvailableDoses(vaccineTypeId);
    return remaining.length === 0;
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

    const availableDoses = getAvailableDoses(formData.vaccine_type_id);
    const isValidDose = availableDoses.some(d => d.dose_type_id === formData.dose_type_id);

    if (!isValidDose) {
      Alert.alert(
        'Invalid dose',
        'This dose cannot be administered yet. Please follow the required sequence.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const selectedVaccine = vaccines.find(v => v.vaccine_type_id === formData.vaccine_type_id);
    const selectedDose = doses.find(d => d.dose_type_id === formData.dose_type_id);

    Alert.alert(
      'Confirm',
      `Save ${selectedVaccine?.vaccine_name} — ${selectedDose?.dose_name} for this child?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: submitImmunization },
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

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_ADD(
          parseInt(child_health_id as string, 10)
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Saved',
          'Immunization recorded successfully.',
          [
            {
              text: 'Add another',
              onPress: () => {
                setFormData({ vaccine_type_id: null, dose_type_id: null });
                // Data will reload on focus next time
              },
            },
            { text: 'Back to records', onPress: handleBackPress },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to save immunization');
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
  const vaccineStatus = immunizationStatus.find(
    s => s.vaccine_type_id === formData.vaccine_type_id
  );

  const allDosesComplete =
    formData.vaccine_type_id != null && availableDoses.length === 0 && !!selectedVaccine;

  const nameLower = (selectedVaccine?.vaccine_name || '').toLowerCase();
  const isBCG = nameLower.includes('bcg');
  const isHepaB =
    nameLower.includes('hepa') ||
    nameLower.includes('hepatitis b') ||
    nameLower.includes('hep b');
  const isAtBirthOnly = isBCG || isHepaB;

  const isSaveDisabled =
    submitting ||
    !formData.vaccine_type_id ||
    !formData.dose_type_id ||
    allDosesComplete;

  // Prevent selecting completed vaccines
  const handleVaccineChange = (value: any) => {
    if (value == null) {
      updateFormData('vaccine_type_id', null);
      updateFormData('dose_type_id', null);
      return;
    }

    if (isVaccineCompleted(value)) {
      const v = vaccines.find(vac => vac.vaccine_type_id === value);
      Alert.alert(
        'Vaccine complete',
        `${v?.vaccine_name || 'This vaccine'} already has all required doses recorded for this child.`
      );
      return;
    }

    updateFormData('vaccine_type_id', value);
    updateFormData('dose_type_id', null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Immunization" onBackPress={handleBackPress} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Child summary */}
        <View style={styles.childCard}>
          <View style={styles.childAvatar}>
            <Ionicons name="medkit" size={26} color={theme.colors.primaryDeep} />
          </View>
          <View style={styles.childInfo}>
            <ThemedText style={styles.childName}>
              {childInfo?.child_full_name || 'Child record'}
            </ThemedText>
            <ThemedText style={styles.childMeta}>
              New immunization entry will be linked to this child.
            </ThemedText>
          </View>
        </View>

        {/* Info line */}
        <View style={styles.infoStrip}>
          <Ionicons name="bulb" size={16} color={theme.colors.primaryDeep} />
          <ThemedText style={styles.infoStripText}>
            BCG and Hepatitis B are given only at birth. Pentavalent is given as 1st, 2nd, and 3rd
            doses. Delays do not block recording as long as the child is under 5 years.
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Immunization details</ThemedText>

          {/* Vaccine */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Vaccine *</ThemedText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.vaccine_type_id}
                onValueChange={handleVaccineChange}
                style={styles.picker}
              >
                <Picker.Item label="Select vaccine..." value={null} />
                {vaccines.map(v => {
                  const completed = isVaccineCompleted(v.vaccine_type_id);
                  return (
                    <Picker.Item
                      key={v.vaccine_type_id}
                      label={completed ? `${v.vaccine_name} (Completed)` : v.vaccine_name}
                      value={v.vaccine_type_id}
                    />
                  );
                })}
              </Picker>
            </View>
          </View>

          {/* Dose */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Dose *</ThemedText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.dose_type_id}
                onValueChange={value => updateFormData('dose_type_id', value)}
                enabled={!!formData.vaccine_type_id && !allDosesComplete}
                style={styles.picker}
              >
                <Picker.Item
                  label={
                    !formData.vaccine_type_id
                      ? 'Select vaccine first...'
                      : allDosesComplete
                      ? 'All required doses completed'
                      : 'Select dose...'
                  }
                  value={null}
                />
                {!allDosesComplete &&
                  availableDoses.map(d => (
                    <Picker.Item
                      key={d.dose_type_id}
                      label={d.dose_name}
                      value={d.dose_type_id}
                    />
                  ))}
              </Picker>
            </View>

            {allDosesComplete && selectedVaccine && (
              <View style={styles.noticeDone}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <ThemedText style={styles.noticeText}>
                  All required doses for {selectedVaccine.vaccine_name} have already been
                  completed.
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Status / Progress */}
        {formData.vaccine_type_id && vaccineStatus && (
          <View style={[styles.card, styles.statusCard]}>
            <ThemedText style={styles.cardTitle}>
              Progress for {selectedVaccine?.vaccine_name}
            </ThemedText>
            <View style={styles.statusRow}>
              {(isAtBirthOnly || selectedVaccine?.at_birth) && (
                <View
                  style={[
                    styles.statusChip,
                    vaccineStatus.at_birth_given && styles.statusChipDone,
                  ]}
                >
                  <Ionicons
                    name={
                      vaccineStatus.at_birth_given ? 'checkmark-circle' : 'ellipse-outline'
                    }
                    size={14}
                    color={
                      vaccineStatus.at_birth_given
                        ? theme.colors.success
                        : theme.colors.textMuted
                    }
                  />
                  <ThemedText style={styles.statusChipText}>At birth</ThemedText>
                </View>
              )}

              {!isAtBirthOnly && (
                <>
                  <View
                    style={[
                      styles.statusChip,
                      vaccineStatus.first_dose_given && styles.statusChipDone,
                    ]}
                  >
                    <Ionicons
                      name={
                        vaccineStatus.first_dose_given
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={14}
                      color={
                        vaccineStatus.first_dose_given
                          ? theme.colors.success
                          : theme.colors.textMuted
                      }
                    />
                    <ThemedText style={styles.statusChipText}>First dose</ThemedText>
                  </View>

                  <View
                    style={[
                      styles.statusChip,
                      vaccineStatus.second_dose_given && styles.statusChipDone,
                    ]}
                  >
                    <Ionicons
                      name={
                        vaccineStatus.second_dose_given
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={14}
                      color={
                        vaccineStatus.second_dose_given
                          ? theme.colors.success
                          : theme.colors.textMuted
                      }
                    />
                    <ThemedText style={styles.statusChipText}>Second dose</ThemedText>
                  </View>

                  <View
                    style={[
                      styles.statusChip,
                      vaccineStatus.third_dose_given && styles.statusChipDone,
                    ]}
                  >
                    <Ionicons
                      name={
                        vaccineStatus.third_dose_given
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={14}
                      color={
                        vaccineStatus.third_dose_given
                          ? theme.colors.success
                          : theme.colors.textMuted
                      }
                    />
                    <ThemedText style={styles.statusChipText}>Third dose</ThemedText>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Save button */}
        <View style={styles.buttonArea}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSaveDisabled}
            style={[
              styles.saveButton,
              isSaveDisabled && styles.saveButtonDisabled,
            ]}
          >
            <ThemedText style={styles.saveButtonText}>
              {submitting ? 'Saving...' : 'Save Immunization'}
            </ThemedText>
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  childMeta: {
    marginTop: 2,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoStripText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.primaryDeep,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  fieldGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  pickerWrapper: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  picker: {
    color: theme.colors.textPrimary,
    backgroundColor: 'transparent',
  },
  noticeDone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.successSoft,
    gap: theme.spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.success,
  },
  statusCard: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successSoft,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  statusChipDone: {
    borderColor: theme.colors.success,
  },
  statusChipText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
  },
  buttonArea: {
    marginTop: theme.spacing.lg,
  },
  saveButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
