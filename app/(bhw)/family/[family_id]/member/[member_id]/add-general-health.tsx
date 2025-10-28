import React, { useState } from 'react';
import {
  View, StyleSheet, SafeAreaView, ScrollView, Alert, Pressable,
  ActivityIndicator, Platform, BackHandler,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
    female: '#EC4899',
    femaleLight: '#FDF2F8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  }
};

export default function AddGeneralHealthScreen() {
  const { family_id, member_id } = useLocalSearchParams<{ 
    family_id: string; 
    member_id: string;
  }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [memberInfo, setMemberInfo] = useState<any>(null);
  
  // Lookup data
  const [medicalHistoryTypes, setMedicalHistoryTypes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [fpMethods, setFPMethods] = useState<any[]>([]);
  const [fpStatuses, setFPStatuses] = useState<any[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    class_id: null as number | null,
    medical_history_ids: [] as number[],
    wra_lmp: null as Date | null,
    fp_method_yn: null as boolean | null,
    fp_method_id: null as number | null,
    fp_status_id: null as number | null,
    smoker: null as boolean | null,
    alcohol_drinker: null as boolean | null,
    sexually_active: null as boolean | null,
    age_of_menarche: null as number | null,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Reset form & load on focus
  useFocusEffect(
    React.useCallback(() => {
      setFormData({
        class_id: null,
        medical_history_ids: [],
        wra_lmp: null,
        fp_method_yn: null,
        fp_method_id: null,
        fp_status_id: null,
        smoker: null,
        alcohol_drinker: null,
        sexually_active: null,
        age_of_menarche: null,
      });
      loadData();
      return () => {};
    }, [member_id])
  );

  // Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.push(`/(bhw)/family/${family_id}/member/${member_id}/` as any);
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [family_id, member_id])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      setUserSession(session);

      // Member info (for sex)
      const memberRes = await fetch(`${API_BASE_URL}/household_api/family-members/${member_id}/`);
      const memberData = await memberRes.json();
      if (memberData.success) {
        setMemberInfo(memberData.data);
      }

      // Lookups
      const [mhRes, classRes, fpMethodRes, fpStatusRes] = await Promise.all([
        fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDICAL_HISTORY_TYPES}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.FP_METHODS}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.FP_STATUSES}`),
      ]);

      setMedicalHistoryTypes(await mhRes.json());
      setClasses(await classRes.json());
      setFPMethods(await fpMethodRes.json());
      setFPStatuses(await fpStatusRes.json());
    } catch (error) {
      console.error('❌ Load error:', error);
      Alert.alert('Error', 'Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMedicalHistory = (id: number) => {
    setFormData(prev => ({
      ...prev,
      medical_history_ids: prev.medical_history_ids.includes(id)
        ? prev.medical_history_ids.filter(mhId => mhId !== id)
        : [...prev.medical_history_ids, id]
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('wra_lmp', selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!formData.class_id) {
      Alert.alert('Required', 'Please select a Population Group/Class');
      return;
    }

    if (formData.smoker === null) {
      Alert.alert('Required', 'Please specify if the member is a smoker');
      return;
    }
    if (formData.alcohol_drinker === null) {
      Alert.alert('Required', 'Please specify if the member drinks alcohol');
      return;
    }
    if (formData.sexually_active === null) {
      Alert.alert('Required', 'Please specify if the member is sexually active');
      return;
    }

    const isFemale = memberInfo?.sex?.toLowerCase() === 'female';

    if (isFemale) {
      if (formData.age_of_menarche === null) {
        Alert.alert('Required', 'Please enter the age of menarche');
        return;
      }
      if (formData.age_of_menarche < 8 || formData.age_of_menarche > 25) {
        Alert.alert('Invalid', 'Age of menarche must be between 8 and 25 years');
        return;
      }

      if (formData.fp_method_yn === true) {
        if (!formData.fp_method_id || !formData.fp_status_id) {
          Alert.alert('Required', 'Please select FP Method and Status');
          return;
        }
      }
    }

    setSubmitting(true);

    try {
    const payload: any = {
      personnel_id: userSession?.user_id || 1,
      class_id: formData.class_id,
      medical_history_ids: formData.medical_history_ids.length > 0 
        ? formData.medical_history_ids 
        : [],
      smoker: formData.smoker,
      alcohol_drinker: formData.alcohol_drinker,
      sexually_active: formData.sexually_active,  
    };

      if (isFemale) {
        if (formData.wra_lmp) {
          payload.wra_lmp = formData.wra_lmp.toISOString().split('T')[0];
        }
        payload.fp_method_yn = formData.fp_method_yn;
        if (formData.fp_method_yn === true) {
          payload.fp_method_id = formData.fp_method_id;
          payload.fp_status_id = formData.fp_status_id;
        }
        payload.age_of_menarche = formData.age_of_menarche;
      }

      const response = await fetch(
        `${API_BASE_URL}/household_api/family-members/${member_id}/general-health/create/`,
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
          'General Health profile saved!',
          [{
            text: 'OK',
            onPress: () => {
              setFormData({
                class_id: null,
                medical_history_ids: [],
                wra_lmp: null,
                fp_method_yn: null,
                fp_method_id: null,
                fp_status_id: null,
                smoker: null,
                alcohol_drinker: null,
                sexually_active: null,
                age_of_menarche: null,
              });
              router.replace(`/(bhw)/family/${family_id}/member/${member_id}/` as any);
            }
          }]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader 
          title="Create Health Profile" 
          onBackPress={() => router.push(`/(bhw)/family/${family_id}/member/${member_id}/` as any)} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading form data...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const isFemale = memberInfo?.sex?.toLowerCase() === 'female';

  const canSubmitVisually =
    !!formData.class_id &&
    formData.smoker !== null &&
    formData.alcohol_drinker !== null &&
    formData.sexually_active !== null &&
    (!isFemale || (
      formData.age_of_menarche !== null &&
      (formData.fp_method_yn !== true || (!!formData.fp_method_id && !!formData.fp_status_id))
    ));

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Create Health Profile" 
        onBackPress={() => router.push(`/(bhw)/family/${family_id}/member/${member_id}` as any)}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Member Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[
              styles.avatar, 
              { backgroundColor: isFemale ? theme.colors.femaleLight : theme.colors.primaryLight }
            ]}>
              <ThemedText style={[
                styles.avatarText,
                { color: isFemale ? theme.colors.female : theme.colors.primary }
              ]}>
                {memberInfo?.resident_full_name?.charAt(0) || '?'}
              </ThemedText>
            </View>
            
            <View style={styles.profileInfo}>
              <ThemedText style={styles.memberName}>
                {memberInfo?.resident_full_name}
              </ThemedText>
              <ThemedText style={styles.memberSubtext}>
                Creating health profile
              </ThemedText>
              <View style={[
                styles.genderBadge,
                { backgroundColor: isFemale ? theme.colors.femaleLight : theme.colors.primaryLight }
              ]}>
                <ThemedText style={[
                  styles.genderText,
                  { color: isFemale ? theme.colors.female : theme.colors.primary }
                ]}>
                  {memberInfo?.sex || 'Unknown'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Population Group Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Population Group</ThemedText>
            <View style={styles.requiredBadge}>
              <ThemedText style={styles.requiredText}>Required</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.cardDescription}>
            Select the applicable population group for this member
          </ThemedText>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.class_id}
              onValueChange={(value) => updateFormData('class_id', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Population Group" value={null} />
              {classes.map((cls) => (
                <Picker.Item 
                  key={cls.class_id} 
                  label={cls.class_description} 
                  value={cls.class_id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Medical History Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Medical History</ThemedText>
            {formData.medical_history_ids.length > 0 && (
              <View style={styles.countBadge}>
                <ThemedText style={styles.countText}>
                  {formData.medical_history_ids.length}
                </ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={styles.cardDescription}>
            Select any medical conditions that apply
          </ThemedText>

          {medicalHistoryTypes?.length > 0 ? (
            <View style={styles.checkboxContainer}>
              {medicalHistoryTypes.map((mh) => {
                const selected = formData.medical_history_ids.includes(mh.medical_history_type_id);
                return (
                  <Pressable
                    key={mh.medical_history_type_id}
                    style={[styles.checkboxRow, selected && styles.checkboxRowSelected]}
                    onPress={() => toggleMedicalHistory(mh.medical_history_type_id)}
                    android_ripple={{ color: theme.colors.dangerLight }}
                    accessible
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={mh.description}
                  >
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <ThemedText style={[
                      styles.checkboxLabel,
                      selected && styles.checkboxLabelSelected
                    ]}>
                      {mh.description}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No medical conditions available</ThemedText>
            </View>
          )}
        </View>

        {/* Lifestyle Section */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Lifestyle Assessment</ThemedText>
          <ThemedText style={styles.cardDescription}>
            Health behavior and lifestyle factors
          </ThemedText>

          <View style={styles.questionsContainer}>
            {/* Smoking */}
            <View style={styles.questionGroup}>
              <ThemedText style={styles.questionTitle}>Does this member smoke?</ThemedText>
              <View style={styles.requiredBadge}>
                <ThemedText style={styles.requiredText}>Required</ThemedText>
              </View>
              <View style={styles.radioRow}>
                <Pressable 
                  style={[styles.radioButton, formData.smoker === true && styles.radioButtonActive]}
                  onPress={() => updateFormData('smoker', true)}
                  android_ripple={{ color: theme.colors.dangerLight }}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formData.smoker === true }}
                >
                  <View style={[styles.radio, formData.smoker === true && styles.radioSelected]}>
                    {formData.smoker === true && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText style={[
                    styles.radioLabel, 
                    formData.smoker === true && styles.radioLabelActive
                  ]}>
                    Yes
                  </ThemedText>
                </Pressable>

                <Pressable 
                  style={[styles.radioButton, formData.smoker === false && styles.radioButtonActive]}
                  onPress={() => updateFormData('smoker', false)}
                  android_ripple={{ color: theme.colors.successLight }}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formData.smoker === false }}
                >
                  <View style={[styles.radio, formData.smoker === false && styles.radioSelected]}>
                    {formData.smoker === false && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText style={[
                    styles.radioLabel, 
                    formData.smoker === false && styles.radioLabelActive
                  ]}>
                    No
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Alcohol */}
            <View style={styles.questionGroup}>
              <ThemedText style={styles.questionTitle}>Does this member drink alcohol?</ThemedText>
              <View style={styles.requiredBadge}>
                <ThemedText style={styles.requiredText}>Required</ThemedText>
              </View>
              <View style={styles.radioRow}>
                <Pressable 
                  style={[styles.radioButton, formData.alcohol_drinker === true && styles.radioButtonActive]}
                  onPress={() => updateFormData('alcohol_drinker', true)}
                  android_ripple={{ color: theme.colors.warningLight }}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formData.alcohol_drinker === true }}
                >
                  <View style={[styles.radio, formData.alcohol_drinker === true && styles.radioSelected]}>
                    {formData.alcohol_drinker === true && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText style={[
                    styles.radioLabel, 
                    formData.alcohol_drinker === true && styles.radioLabelActive
                  ]}>
                    Yes
                  </ThemedText>
                </Pressable>

                <Pressable 
                  style={[styles.radioButton, formData.alcohol_drinker === false && styles.radioButtonActive]}
                  onPress={() => updateFormData('alcohol_drinker', false)}
                  android_ripple={{ color: theme.colors.successLight }}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formData.alcohol_drinker === false }}
                >
                  <View style={[styles.radio, formData.alcohol_drinker === false && styles.radioSelected]}>
                    {formData.alcohol_drinker === false && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText style={[
                    styles.radioLabel, 
                    formData.alcohol_drinker === false && styles.radioLabelActive
                  ]}>
                    No
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Sexual Activity */}
            <View style={styles.questionGroup}>
              <ThemedText style={styles.questionTitle}>Is this member sexually active?</ThemedText>
              <View style={styles.requiredBadge}>
                <ThemedText style={styles.requiredText}>Required</ThemedText>
              </View>
              <View style={styles.radioRow}>
                <Pressable 
                  style={[styles.radioButton, formData.sexually_active === true && styles.radioButtonActive]}
                  onPress={() => updateFormData('sexually_active', true)}
                  android_ripple={{ color: theme.colors.primaryLight }}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formData.sexually_active === true }}
                >
                  <View style={[styles.radio, formData.sexually_active === true && styles.radioSelected]}>
                    {formData.sexually_active === true && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText style={[
                    styles.radioLabel, 
                    formData.sexually_active === true && styles.radioLabelActive
                  ]}>
                    Yes
                  </ThemedText>
                </Pressable>

                <Pressable 
                  style={[styles.radioButton, formData.sexually_active === false && styles.radioButtonActive]}
                  onPress={() => updateFormData('sexually_active', false)}
                  android_ripple={{ color: theme.colors.border }}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formData.sexually_active === false }}
                >
                  <View style={[styles.radio, formData.sexually_active === false && styles.radioSelected]}>
                    {formData.sexually_active === false && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText style={[
                    styles.radioLabel, 
                    formData.sexually_active === false && styles.radioLabelActive
                  ]}>
                    No
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Women's Health Section */}
        {isFemale && (
          <View style={[styles.card, styles.womensHealthCard]}>
            <ThemedText style={styles.cardTitle}>Women&apos;s Health</ThemedText>
            <ThemedText style={styles.cardDescription}>
              Reproductive health information
            </ThemedText>

            {/* Age of Menarche */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Age of Menarche</ThemedText>
              <View style={styles.requiredBadge}>
                <ThemedText style={styles.requiredText}>Required</ThemedText>
              </View>
              <ThemedText style={styles.inputDescription}>
                Age when menstruation first began (8-25 years)
              </ThemedText>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.age_of_menarche?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text ? parseInt(text) : null;
                    updateFormData('age_of_menarche', value);
                  }}
                  placeholder="Enter age (8-25)"
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </View>

            {/* Last Menstrual Period */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Last Menstrual Period</ThemedText>
              <ThemedText style={styles.inputDescription}>
                Optional - for maternal health tracking
              </ThemedText>

              <Pressable 
                style={styles.dateButton} 
                onPress={() => setShowDatePicker(true)}
                android_ripple={{ color: theme.colors.femaleLight }}
              >
                <ThemedText style={styles.dateButtonText}>
                  {formData.wra_lmp ? formData.wra_lmp.toLocaleDateString() : 'Select date'}
                </ThemedText>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={formData.wra_lmp || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Family Planning */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Using Family Planning?</ThemedText>
              
              <View style={styles.radioRow}>
                <Pressable 
                  style={[styles.radioButton, formData.fp_method_yn === true && styles.radioButtonActive]}
                  onPress={() => updateFormData('fp_method_yn', true)}
                  android_ripple={{ color: theme.colors.successLight }}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formData.fp_method_yn === true }}
                  accessibilityLabel="Using family planning: Yes"
                >
                  <View style={[styles.radio, formData.fp_method_yn === true && styles.radioSelected]}>
                    {formData.fp_method_yn === true && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText style={[
                    styles.radioLabel, 
                    formData.fp_method_yn === true && styles.radioLabelActive
                  ]}>
                    Yes
                  </ThemedText>
                </Pressable>

                <Pressable 
                  style={[styles.radioButton, formData.fp_method_yn === false && styles.radioButtonActive]}
                  onPress={() => updateFormData('fp_method_yn', false)}
                  android_ripple={{ color: theme.colors.border }}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formData.fp_method_yn === false }}
                  accessibilityLabel="Using family planning: No"
                >
                  <View style={[styles.radio, formData.fp_method_yn === false && styles.radioSelected]}>
                    {formData.fp_method_yn === false && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText style={[
                    styles.radioLabel, 
                    formData.fp_method_yn === false && styles.radioLabelActive
                  ]}>
                    No
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {formData.fp_method_yn === true && (
              <>
                {/* FP Method */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Family Planning Method</ThemedText>
                  <View style={styles.requiredBadge}>
                    <ThemedText style={styles.requiredText}>Required</ThemedText>
                  </View>
                  
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.fp_method_id}
                      onValueChange={(value) => updateFormData('fp_method_id', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select FP Method" value={null} />
                      {fpMethods.map((method) => (
                        <Picker.Item 
                          key={method.fp_method_id} 
                          label={method.description} 
                          value={method.fp_method_id} 
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* FP Status */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Family Planning Status</ThemedText>
                  <View style={styles.requiredBadge}>
                    <ThemedText style={styles.requiredText}>Required</ThemedText>
                  </View>
                  
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.fp_status_id}
                      onValueChange={(value) => updateFormData('fp_status_id', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select FP Status" value={null} />
                      {fpStatuses.map((status) => (
                        <Picker.Item 
                          key={status.fp_status_id} 
                          label={status.description} 
                          value={status.fp_status_id} 
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Pressable
          style={[styles.submitButton, (submitting || !canSubmitVisually) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || !canSubmitVisually}
          android_ripple={{ color: theme.colors.successLight }}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Create Health Profile</ThemedText>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Profile Card
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  memberName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  memberSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  genderBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.xs,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Cards
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },
  womensHealthCard: {
    backgroundColor: theme.colors.femaleLight,
    borderWidth: 1,
    borderColor: theme.colors.female,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },

  // Required Badge
  requiredBadge: {
    backgroundColor: theme.colors.dangerLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
  },
  requiredText: {
    fontSize: 10,
    color: theme.colors.danger,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Count Badge
  countBadge: {
    backgroundColor: theme.colors.primaryLight,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  // Picker
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

  // Checkboxes
  checkboxContainer: {
    gap: theme.spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  checkboxRowSelected: {
    backgroundColor: theme.colors.dangerLight,
    borderColor: theme.colors.danger,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  checkboxLabelSelected: {
    color: theme.colors.danger,
    fontWeight: '600',
  },

  // Questions
  questionsContainer: {
    gap: theme.spacing.xl,
  },
  questionGroup: {
    gap: theme.spacing.md,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  radioRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  radioButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
  radioLabelActive: {
    color: theme.colors.primary,
  },

  // Input Components
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  inputDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  textInput: {
    paddingVertical: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },

  // Date Button
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
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },

  // Submit Container
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadow,
  },
  submitButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
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