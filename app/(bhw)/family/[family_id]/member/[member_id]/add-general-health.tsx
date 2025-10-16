import React, { useState } from 'react';
import {
  View, StyleSheet, SafeAreaView, ScrollView, Alert, Pressable,
  ActivityIndicator, Platform, BackHandler,
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

export default function AddGeneralHealthScreen() {
  const { family_id, member_id } = useLocalSearchParams<{ 
    family_id: string; 
    member_id: string;
  }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // ✅ Store member info including sex
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

    const isFemale = memberInfo?.sex?.toLowerCase() === 'female';
    
    if (isFemale && formData.fp_method_yn === true) {
      if (!formData.fp_method_id || !formData.fp_status_id) {
        Alert.alert('Required', 'Please select FP Method and Status');
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload: any = {
        personnel_id: userSession?.user_id || 1,
        class_id: formData.class_id,
        medical_history_ids: formData.medical_history_ids.length > 0 
          ? formData.medical_history_ids 
          : null,
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
          title="Add General Health" 
          onBackPress={() => router.push(`/(bhw)/family/${family_id}/member/${member_id}/` as any)} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
        </View>
      </SafeAreaView>
    );
  }

  const isFemale = memberInfo?.sex?.toLowerCase() === 'female';

  const canSubmitVisually =
    !!formData.class_id &&
    (!isFemale || formData.fp_method_yn !== true || (!!formData.fp_method_id && !!formData.fp_status_id));

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Add General Health" 
        onBackPress={() => router.push(`/(bhw)/family/${family_id}/member/${member_id}` as any)}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Member Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#0c4a6e" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText numberOfLines={1} style={styles.infoText}>
                {memberInfo?.resident_full_name}
              </ThemedText>
              <ThemedText style={styles.infoSubText}>
                Member #{member_id}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.sexBadge, { borderColor: isFemale ? '#FCE7F3' : '#DBEAFE' }]}>
            <Ionicons 
              name={isFemale ? 'female' : 'male'} 
              size={14} 
              color={isFemale ? '#EC4899' : '#3B82F6'} 
            />
            <ThemedText style={[
              styles.sexText,
              { color: isFemale ? '#EC4899' : '#3B82F6' }
            ]}>
              {memberInfo?.sex || 'Unknown'}
            </ThemedText>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medkit-outline" size={18} color="#FF3D33" />
            <ThemedText style={styles.sectionTitle}>General Health</ThemedText>
          </View>

          {/* Class - REQUIRED */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Population Group *</ThemedText>
            <View style={styles.picker}>
              <Picker
                selectedValue={formData.class_id}
                onValueChange={(value) => updateFormData('class_id', value)}
              >
                <Picker.Item label="Select Class" value={null} />
                {classes.map((cls) => (
                  <Picker.Item 
                    key={cls.class_id} 
                    label={cls.class_description} 
                    value={cls.class_id} 
                  />
                ))}
              </Picker>
            </View>
            <ThemedText style={styles.helperText}>
              Choose the applicable population group for this member.
            </ThemedText>
          </View>

          <View style={styles.divider} />

          {/* Medical History — Checkbox style */}
          <View style={styles.inputGroup}>
            <View style={styles.inlineHeader}>
              <ThemedText style={styles.label}>Medical History (Optional)</ThemedText>
              {formData.medical_history_ids.length > 0 && (
                <ThemedText style={styles.smallCounter}>
                  {formData.medical_history_ids.length} selected
                </ThemedText>
              )}
            </View>

            {medicalHistoryTypes?.length > 0 ? (
              <View style={styles.checkboxWrap}>
                {medicalHistoryTypes.map((mh) => {
                  const selected = formData.medical_history_ids.includes(mh.medical_history_type_id);
                  return (
                    <Pressable
                      key={mh.medical_history_type_id}
                      style={styles.checkboxRow}
                      onPress={() => toggleMedicalHistory(mh.medical_history_type_id)}
                      android_ripple={{ color: '#E5E7EB' }}
                      accessible
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={mh.description}
                    >
                      <View style={[styles.checkboxBox, selected && styles.checkboxBoxSelected]}>
                        {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        {mh.description}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>No medical history options available.</ThemedText>
            )}
          </View>

          {/* ✅ Only show female fields if member is female */}
          {isFemale && (
            <>
              <View style={styles.sectionSubheader}>
                <Ionicons name="female" size={16} color="#EC4899" />
                <ThemedText style={styles.sectionSubtitle}>Women's Health</ThemedText>
              </View>

              {/* LMP */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Last Menstrual Period</ThemedText>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                  android_ripple={{ color: '#E2E8F0' }}
                >
                  <Ionicons name="calendar-outline" size={18} color="#64748B" />
                  <ThemedText style={styles.dateText}>
                    {formData.wra_lmp ? formData.wra_lmp.toLocaleDateString() : 'Select date'}
                  </ThemedText>
                </Pressable>
                <ThemedText style={styles.helperText}>
                  Optional. Used for context in maternal health assessments.
                </ThemedText>
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
                <ThemedText style={styles.label}>Using Family Planning?</ThemedText>
                <View style={styles.radioGroup}>
                  <Pressable 
                    style={styles.radioRow} 
                    onPress={() => updateFormData('fp_method_yn', true)}
                    android_ripple={{ color: '#E5E7EB' }}
                    accessible
                    accessibilityRole="radio"
                    accessibilityState={{ selected: formData.fp_method_yn === true }}
                    accessibilityLabel="Using family planning: Yes"
                  >
                    <View style={[styles.radio, formData.fp_method_yn === true && styles.radioActive]}>
                      {formData.fp_method_yn === true && <View style={styles.radioInner} />}
                    </View>
                    <ThemedText style={styles.radioLabel}>YES</ThemedText>
                  </Pressable>

                  <Pressable 
                    style={styles.radioRow} 
                    onPress={() => updateFormData('fp_method_yn', false)}
                    android_ripple={{ color: '#E5E7EB' }}
                    accessible
                    accessibilityRole="radio"
                    accessibilityState={{ selected: formData.fp_method_yn === false }}
                    accessibilityLabel="Using family planning: No"
                  >
                    <View style={[styles.radio, formData.fp_method_yn === false && styles.radioActive]}>
                      {formData.fp_method_yn === false && <View style={styles.radioInner} />}
                    </View>
                    <ThemedText style={styles.radioLabel}>NO</ThemedText>
                  </Pressable>
                </View>
              </View>

              {formData.fp_method_yn === true && (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>FP Method *</ThemedText>
                    <View style={styles.picker}>
                      <Picker
                        selectedValue={formData.fp_method_id}
                        onValueChange={(value) => updateFormData('fp_method_id', value)}
                      >
                        <Picker.Item label="Select Method" value={null} />
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

                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>FP Status *</ThemedText>
                    <View style={styles.picker}>
                      <Picker
                        selectedValue={formData.fp_status_id}
                        onValueChange={(value) => updateFormData('fp_status_id', value)}
                      >
                        <Picker.Item label="Select Status" value={null} />
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
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer Action */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.submitButton,
            (submitting || !canSubmitVisually) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={submitting}
          android_ripple={{ color: '#065F46' }}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Save</ThemedText>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },

  // Header card
  infoCard: { 
    backgroundColor: '#E0F2FE', 
    padding: 16, 
    margin: 16, 
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#CFFAFE',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#A5F3FC'
  },
  infoText: { fontSize: 16, fontWeight: '700', color: '#0c4a6e' },
  infoSubText: { fontSize: 12, color: '#0ea5e9', marginTop: 2 },
  sexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
  },
  sexText: { fontSize: 12, fontWeight: '700' },

  // Sections
  section: { 
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginHorizontal: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 1
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#FF3D33' },
  sectionSubheader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 12 },
  sectionSubtitle: { fontSize: 16, fontWeight: '700', color: '#EC4899' },

  // Inputs
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
  helperText: { fontSize: 12, color: '#6B7280', marginTop: 6 },
  picker: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, backgroundColor: '#F9FAFB' },

  // Divider
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12, borderRadius: 1 },

  // Checkbox list
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  smallCounter: { fontSize: 12, color: '#6B7280' },
  checkboxWrap: { flexDirection: 'column', gap: 6 },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748B',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  checkboxLabel: { marginLeft: 10, fontSize: 14, color: '#111827' },
  emptyText: { fontSize: 13, color: '#6B7280' },

  // Date & radios
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8
  },
  dateText: { color: '#0F172A' },

  radioGroup: { flexDirection: 'row', gap: 24, marginTop: 2 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4, paddingRight: 8 },
  radio: { width: 22, height: 22, borderWidth: 2, borderColor: '#3B82F6', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#1D4ED8' },
  radioInner: { width: 12, height: 12, backgroundColor: '#3B82F6', borderRadius: 6 },
  radioLabel: { fontSize: 13, fontWeight: '800', color: '#111827', letterSpacing: 0.5 },

  // Sticky footer
  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -2 }, shadowRadius: 8, elevation: 12
  },
  submitButton: { 
    backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 
  },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
