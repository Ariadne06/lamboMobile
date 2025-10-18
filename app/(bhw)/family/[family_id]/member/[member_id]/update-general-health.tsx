import React, { useState, useEffect } from 'react';
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
import { API_BASE_URL } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { useFocusEffect } from '@react-navigation/native';

export default function UpdateGeneralHealthScreen() {
  const { family_id, member_id } = useLocalSearchParams<{ 
    family_id: string; 
    member_id: string;
  }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [existingGH, setExistingGH] = useState<any>(null);
  
  // Lookup data
  const [medicalHistoryTypes, setMedicalHistoryTypes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [fpMethods, setFPMethods] = useState<any[]>([]);
  const [fpStatuses, setFPStatuses] = useState<any[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    class_id: null as number | null,
    apply_med_hist: false,
    medical_history_ids: [] as number[],
    apply_fp: false,
    wra_lmp: null as Date | null,
    fp_method_yn: null as boolean | null,
    fp_method_id: null as number | null,
    fp_status_id: null as number | null,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [member_id]);

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

      // Fetch member + existing GH data
      const memberRes = await fetch(`${API_BASE_URL}/household_api/family-members/${member_id}/`);
      const memberData = await memberRes.json();
      
      if (memberData.success) {
        setMemberInfo(memberData.data);
        setExistingGH(memberData.data);
        
        // Pre-fill form with existing values
        setFormData({
          class_id: memberData.data.gh_class_id,
          apply_med_hist: false,
          medical_history_ids: Array.isArray(memberData.data.gh_medical_history_ids) 
            ? memberData.data.gh_medical_history_ids 
            : [],
          apply_fp: false,
          wra_lmp: memberData.data.gh_last_menstrual_period 
            ? new Date(memberData.data.gh_last_menstrual_period) 
            : null,
          fp_method_yn: memberData.data.gh_fp_method_yn,
          fp_method_id: memberData.data.gh_fp_method_id,
          fp_status_id: memberData.data.gh_fp_status_id,
        });
      }

      // Fetch lookups
      const [mhRes, classRes, fpMethodRes, fpStatusRes] = await Promise.all([
        fetch(`${API_BASE_URL}/household_api/medical-history-types/`),
        fetch(`${API_BASE_URL}/household_api/classes/`),
        fetch(`${API_BASE_URL}/household_api/fp-methods/`),
        fetch(`${API_BASE_URL}/household_api/fp-statuses/`),
      ]);

      setMedicalHistoryTypes(await mhRes.json());
      setClasses(await classRes.json());
      setFPMethods(await fpMethodRes.json());
      setFPStatuses(await fpStatusRes.json());
    } catch (error) {
      console.error('❌ Load error:', error);
      Alert.alert('Error', 'Failed to load data');
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
      apply_med_hist: true, // Automatically set when user changes
      medical_history_ids: prev.medical_history_ids.includes(id)
        ? prev.medical_history_ids.filter(mhId => mhId !== id)
        : [...prev.medical_history_ids, id]
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('wra_lmp', selectedDate);
      updateFormData('apply_fp', true); // Auto-set apply_fp
    }
  };

  const handleSubmit = async () => {
    if (!formData.class_id) {
      Alert.alert('Required', 'Please select a Population Group/Class');
      return;
    }

    const isFemale = memberInfo?.sex?.toLowerCase() === 'female';
    
    if (isFemale && formData.apply_fp && formData.fp_method_yn === true) {
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
        apply_med_hist: formData.apply_med_hist,
        medical_history_ids: formData.apply_med_hist ? formData.medical_history_ids : null,
      };

      if (isFemale && formData.apply_fp) {
        if (formData.wra_lmp) {
          payload.wra_lmp = formData.wra_lmp.toISOString().split('T')[0];
        }
        payload.apply_fp = true;
        payload.fp_method_yn = formData.fp_method_yn;
        if (formData.fp_method_yn === true) {
          payload.fp_method_id = formData.fp_method_id;
          payload.fp_status_id = formData.fp_status_id;
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/household_api/family-members/${member_id}/general-health/update/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Success',
          'General Health profile updated!',
          [{
            text: 'OK',
            onPress: () => {
              router.replace(`/(bhw)/family/${family_id}/member/${member_id}/` as any);
            }
          }]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to update');
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
          title="Update General Health" 
          onBackPress={() => router.push(`/(bhw)/family/${family_id}/member/${member_id}/` as any)} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
        </View>
      </SafeAreaView>
    );
  }

  const isFemale = memberInfo?.sex?.toLowerCase() === 'female';

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Update General Health" 
        onBackPress={() => router.push(`/(bhw)/family/${family_id}/member/${member_id}` as any)}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Member Info Card */}
        <View style={styles.infoCard}>
          <ThemedText style={styles.infoText}>{memberInfo?.resident_full_name}</ThemedText>
          <ThemedText style={styles.infoSubText}>Updating General Health Record</ThemedText>
        </View>

        {/* Form Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>General Health</ThemedText>

          {/* Class */}
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
          </View>

          <View style={styles.divider} />

          {/* Medical History */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Medical History (Optional)</ThemedText>
            <View style={styles.checkboxWrap}>
              {medicalHistoryTypes.map((mh) => {
                const selected = formData.medical_history_ids.includes(mh.medical_history_type_id);
                return (
                  <Pressable
                    key={mh.medical_history_type_id}
                    style={styles.checkboxRow}
                    onPress={() => toggleMedicalHistory(mh.medical_history_type_id)}
                  >
                    <View style={[styles.checkboxBox, selected && styles.checkboxBoxSelected]}>
                      {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <ThemedText style={styles.checkboxLabel}>{mh.description}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Female-specific fields */}
          {isFemale && (
            <>
              <View style={styles.divider} />
              <ThemedText style={styles.sectionSubtitle}>Women's Health</ThemedText>

              {/* LMP */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Last Menstrual Period</ThemedText>
                <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={18} color="#64748B" />
                  <ThemedText style={styles.dateText}>
                    {formData.wra_lmp ? formData.wra_lmp.toLocaleDateString() : 'Select date'}
                  </ThemedText>
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

              {/* FP */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Using Family Planning?</ThemedText>
                <View style={styles.radioGroup}>
                  <Pressable 
                    style={styles.radioRow} 
                    onPress={() => {
                      updateFormData('fp_method_yn', true);
                      updateFormData('apply_fp', true);
                    }}
                  >
                    <View style={[styles.radio, formData.fp_method_yn === true && styles.radioActive]}>
                      {formData.fp_method_yn === true && <View style={styles.radioInner} />}
                    </View>
                    <ThemedText style={styles.radioLabel}>YES</ThemedText>
                  </Pressable>

                  <Pressable 
                    style={styles.radioRow} 
                    onPress={() => {
                      updateFormData('fp_method_yn', false);
                      updateFormData('apply_fp', true);
                    }}
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
                        {fpMethods.map((m) => (
                          <Picker.Item key={m.fp_method_id} label={m.description} value={m.fp_method_id} />
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
                        {fpStatuses.map((s) => (
                          <Picker.Item key={s.fp_status_id} label={s.description} value={s.fp_status_id} />
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

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Update</ThemedText>
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
  infoCard: { backgroundColor: '#E0F2FE', padding: 16, margin: 16, borderRadius: 14 },
  infoText: { fontSize: 16, fontWeight: '700', color: '#0c4a6e' },
  infoSubText: { fontSize: 12, color: '#0ea5e9', marginTop: 2 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#FF3D33', marginBottom: 16 },
  sectionSubtitle: { fontSize: 16, fontWeight: '700', color: '#EC4899', marginBottom: 12 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
  picker: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, backgroundColor: '#F9FAFB' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  checkboxWrap: { flexDirection: 'column', gap: 6 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkboxBox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#64748B', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  checkboxBoxSelected: { backgroundColor: '#10B981', borderColor: '#059669' },
  checkboxLabel: { marginLeft: 10, fontSize: 14, color: '#111827' },
  dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  dateText: { color: '#0F172A' },
  radioGroup: { flexDirection: 'row', gap: 24, marginTop: 2 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  radio: { width: 22, height: 22, borderWidth: 2, borderColor: '#3B82F6', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#1D4ED8' },
  radioInner: { width: 12, height: 12, backgroundColor: '#3B82F6', borderRadius: 6 },
  radioLabel: { fontSize: 13, fontWeight: '800', color: '#111827' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  submitButton: { backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});