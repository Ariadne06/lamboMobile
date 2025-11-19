import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

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
    danger: '#EF4444',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface ChildHealthData {
  child_health_id: number;
  child_full_name: string;
  place_of_delivery?: string;
  address_landmark?: string;
  tt_status_id?: number;
  tt_status_name?: string;
  tt_status_date?: string;
  newborn_screening_status?: boolean;
  newborn_screening_status_date?: string;
  feeding_method_id?: number;
  feeding_method_name?: string;
}

export default function UpdateChildHealthRecordScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [childData, setChildData] = useState<ChildHealthData | null>(null);

  // Dropdown options
  const [feedingMethods, setFeedingMethods] = useState<any[]>([]);
  const [ttStatuses, setTTStatuses] = useState<any[]>([]);

  // Date pickers
  const [showTTDatePicker, setShowTTDatePicker] = useState(false);
  const [showScreeningDatePicker, setShowScreeningDatePicker] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    place_of_delivery: '',
    address_landmark: '',
    tt_status_of_mother: null as number | null,
    tt_status_date: null as Date | null,
    newborn_screening_status: null as boolean | null,
    newborn_screening_status_date: null as Date | null,
    feeding_method_id: null as number | null,
  });

  useEffect(() => {
    loadData();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/child-health/${child_health_id}` as any);
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

      // Load child health record
      const recordResponse = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/`
      );
      const recordData = await recordResponse.json();

      if (!recordData.success) {
        Alert.alert('Error', 'Failed to load child health record');
        router.back();
        return;
      }

      const record = recordData.data;
      setChildData(record);

      // Set form data from record
      setFormData({
        place_of_delivery: record.place_of_delivery || '',
        address_landmark: record.address_landmark || '',
        tt_status_of_mother: record.tt_status_id || null,
        tt_status_date: record.tt_status_date ? new Date(record.tt_status_date) : null,
        newborn_screening_status: record.newborn_screening_status ?? null,
        newborn_screening_status_date: record.newborn_screening_status_date 
          ? new Date(record.newborn_screening_status_date) 
          : null,
        feeding_method_id: record.feeding_method_id || null,
      });

      // Load dropdown options
      const [feedingRes, ttRes] = await Promise.all([
        fetch(`${API_BASE_URL}${API_ENDPOINTS.CHILD_HEALTH_FEEDING_METHODS}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.CHILD_HEALTH_TT_STATUSES}`),
      ]);

      setFeedingMethods(await feedingRes.json());
      setTTStatuses(await ttRes.json());

    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTTDateChange = (event: any, selectedDate?: Date) => {
    setShowTTDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('tt_status_date', selectedDate);
    }
  };

  const handleScreeningDateChange = (event: any, selectedDate?: Date) => {
    setShowScreeningDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('newborn_screening_status_date', selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const validateForm = () => {
    if (formData.newborn_screening_status === true && !formData.newborn_screening_status_date) {
      Alert.alert('Required', 'Please enter newborn screening date when screening is completed');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Confirm Update',
      'Are you sure you want to update this child health record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: submitUpdate }
      ]
    );
  };

  const submitUpdate = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      const payload: any = {
        personnel_id: personnelId,
      };

      // Only include fields that have values
      if (formData.place_of_delivery) payload.place_of_delivery = formData.place_of_delivery;
      if (formData.address_landmark) payload.address_landmark = formData.address_landmark;
      if (formData.tt_status_of_mother) payload.tt_status_of_mother = formData.tt_status_of_mother;
      if (formData.tt_status_date) {
        payload.tt_status_date = formData.tt_status_date.toISOString().split('T')[0];
      }
      if (formData.newborn_screening_status !== null) {
        payload.newborn_screening_status = formData.newborn_screening_status;
      }
      if (formData.newborn_screening_status_date) {
        payload.newborn_screening_status_date = formData.newborn_screening_status_date.toISOString().split('T')[0];
      }
      if (formData.feeding_method_id) payload.feeding_method_id = formData.feeding_method_id;

      console.log('📤 Submitting update:', payload);

      const response = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/update/`,
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
          'Child health record updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.push(`/(bhw)/child-health/${child_health_id}` as any),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to update record');
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
        <CustomHeader 
          title="Update Child Health Record" 
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!childData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Update Child Health Record" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <ThemedText>Record not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Update Child Health Record" onBackPress={handleBackPress} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Child Info Header */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="child-care" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Child Information</ThemedText>
          </View>
          <ThemedText style={styles.childName}>{childData.child_full_name}</ThemedText>
          <ThemedText style={styles.childSubtext}>ID: CHR{childData.child_health_id}</ThemedText>
        </View>

        {/* Delivery Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Delivery Information</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Place of Delivery</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.place_of_delivery}
              onChangeText={(value) => updateFormData('place_of_delivery', value)}
              placeholder="e.g., Cebu City Hospital"
              placeholderTextColor={theme.colors.textMuted}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Address Landmark</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.address_landmark}
              onChangeText={(value) => updateFormData('address_landmark', value)}
              placeholder="e.g., Near church"
              placeholderTextColor={theme.colors.textMuted}
              multiline
            />
          </View>
        </View>

        {/* Mother's TT Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="vaccines" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Mother's TT Status</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>TT Status</ThemedText>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.tt_status_of_mother}
                onValueChange={(value) => updateFormData('tt_status_of_mother', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select TT Status" value={null} />
                {ttStatuses.map((status) => (
                  <Picker.Item
                    key={status.tt_status_id}
                    label={`${status.tt_code} - ${status.tt_name}`}
                    value={status.tt_status_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {formData.tt_status_of_mother && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>TT Date</ThemedText>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTTDatePicker(true)}
              >
                <ThemedText style={formData.tt_status_date ? styles.dateButtonTextFilled : styles.dateButtonText}>
                  {formatDate(formData.tt_status_date)}
                </ThemedText>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {showTTDatePicker && (
            <DateTimePicker
              value={formData.tt_status_date || new Date()}
              mode="date"
              display="default"
              onChange={handleTTDateChange}
            />
          )}
        </View>

        {/* Newborn Screening */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="medical-services" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Newborn Screening</ThemedText>
          </View>

          <View style={styles.radioGroup}>
            <ThemedText style={styles.label}>Screening Status</ThemedText>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.newborn_screening_status === true && styles.radioButtonActive,
                ]}
                onPress={() => updateFormData('newborn_screening_status', true)}
              >
                <View style={styles.radio}>
                  {formData.newborn_screening_status === true && <View style={styles.radioInner} />}
                </View>
                <ThemedText style={styles.radioLabel}>Completed</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.newborn_screening_status === false && styles.radioButtonActive,
                ]}
                onPress={() => updateFormData('newborn_screening_status', false)}
              >
                <View style={styles.radio}>
                  {formData.newborn_screening_status === false && <View style={styles.radioInner} />}
                </View>
                <ThemedText style={styles.radioLabel}>Not Done</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {formData.newborn_screening_status === true && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Screening Date *</ThemedText>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowScreeningDatePicker(true)}
              >
                <ThemedText style={formData.newborn_screening_status_date ? styles.dateButtonTextFilled : styles.dateButtonText}>
                  {formatDate(formData.newborn_screening_status_date)}
                </ThemedText>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {showScreeningDatePicker && (
            <DateTimePicker
              value={formData.newborn_screening_status_date || new Date()}
              mode="date"
              display="default"
              onChange={handleScreeningDateChange}
            />
          )}
        </View>

        {/* Feeding Method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="local-dining" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Feeding Method</ThemedText>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.feeding_method_id}
              onValueChange={(value) => updateFormData('feeding_method_id', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Feeding Method" value={null} />
              {feedingMethods.map((method) => (
                <Picker.Item
                  key={method.feeding_method_id}
                  label={method.method_name}
                  value={method.feeding_method_id}
                />
              ))}
            </Picker>
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
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Update Record</ThemedText>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  childName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  childSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
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
    minHeight: 50,
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
    fontSize: 15,
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
    minHeight: 50,
  },
  dateButtonText: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  dateButtonTextFilled: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  radioGroup: {
    marginBottom: theme.spacing.lg,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.warning,
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