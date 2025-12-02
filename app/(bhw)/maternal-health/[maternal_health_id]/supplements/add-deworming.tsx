import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Platform,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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
    primary: '#8B5CF6',
    primaryLight: '#EDE9FE',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    error: '#EF4444',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface DewormingType {
  deworming_type_id: number;
  deworming_name: string;
}

export default function AddDewormingScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dewormingTypes, setDewormingTypes] = useState<DewormingType[]>([]);
  const [maternalName, setMaternalName] = useState('');

  const [formData, setFormData] = useState({
    deworming_type_id: null as number | null,
    date_given: new Date(),
    number_of_tablets: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  const handleBackPress = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/supplements` as any);
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
      const session = await getUserSession();
      if (!session) {
        Alert.alert('Error', 'Session expired. Please login again.');
        router.push('/(auth)/login');
        return;
      }

      // Fetch deworming types
      const typesResponse = await fetch(`${API_BASE_URL}/household_api/deworming-types/`);
      const typesData = await typesResponse.json();
      setDewormingTypes(typesData || []);

      // Fetch maternal name
      const mhrResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const mhrData = await mhrResponse.json();
      if (mhrData.success && mhrData.data) {
        setMaternalName(mhrData.data.full_name || '');
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Error', 'Failed to load deworming types');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.deworming_type_id) {
      newErrors.deworming_type_id = 'Please select a deworming type';
    }

    if (formData.number_of_tablets && parseInt(formData.number_of_tablets) < 0) {
      newErrors.number_of_tablets = 'Number must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setFormData({
      deworming_type_id: null,
      date_given: new Date(),
      number_of_tablets: '',
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setSubmitting(true);
    try {
      const session = await getUserSession();
      
      const payload = {
        deworming_type_id: formData.deworming_type_id,
        date_given: formData.date_given.toISOString().split('T')[0],
        number_of_tablets: formData.number_of_tablets ? parseInt(formData.number_of_tablets) : null,
        personnel_id: session?.user_id,
      };

      console.log('📤 Submitting deworming:', payload);

      const response = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/deworming/add/`,
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
        clearForm();
        Alert.alert(
          'Success',
          'Deworming recorded successfully!',
          [
            {
              text: 'Add Another',
              onPress: () => {
                // Form already cleared
              }
            },
            {
              text: 'View Records',
              onPress: () => router.push(`/(bhw)/maternal-health/${maternal_health_id}/supplements` as any)
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to record deworming');
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      Alert.alert('Error', 'Failed to submit. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, date_given: selectedDate });
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
        <CustomHeader title="Add Deworming" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Deworming" onBackPress={handleBackPress} />

      {/* Banner Card */}
      <View style={styles.bannerCard}>
        <MaterialCommunityIcons name="bottle-tonic" size={28} color={theme.colors.primary} />
        <View style={styles.bannerInfo}>
          <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
          <ThemedText style={styles.bannerSubtext}>Recording deworming medication</ThemedText>
        </View>
      </View>

      {/* Warning Notice */}
      <View style={styles.warningCard}>
        <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
        <ThemedText style={styles.warningText}>
          Deworming (Albendazole) is only allowed in the Third trimester
        </ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bottle-tonic" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Deworming Information</ThemedText>
          </View>

          {/* Deworming Type */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Deworming Type *</ThemedText>
            <View style={[styles.pickerContainer, errors.deworming_type_id && styles.inputError]}>
              <Picker
                selectedValue={formData.deworming_type_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, deworming_type_id: value });
                  if (errors.deworming_type_id) {
                    setErrors({ ...errors, deworming_type_id: '' });
                  }
                }}
              >
                <Picker.Item label="Select deworming type..." value={null} />
                {dewormingTypes.map((type) => (
                  <Picker.Item
                    key={type.deworming_type_id}
                    label={type.deworming_name}
                    value={type.deworming_type_id}
                  />
                ))}
              </Picker>
            </View>
            {errors.deworming_type_id && (
              <ThemedText style={styles.errorText}>{errors.deworming_type_id}</ThemedText>
            )}
          </View>

          {/* Date Given */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Date Given *</ThemedText>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={styles.dateButtonText}>{formatDate(formData.date_given)}</ThemedText>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.date_given}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Number of Tablets */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Number of Tablets (Optional)</ThemedText>
            <TextInput
              style={[styles.input, errors.number_of_tablets && styles.inputError]}
              placeholder="e.g., 1"
              keyboardType="number-pad"
              value={formData.number_of_tablets}
              onChangeText={(text) => {
                setFormData({ ...formData, number_of_tablets: text });
                if (errors.number_of_tablets) {
                  setErrors({ ...errors, number_of_tablets: '' });
                }
              }}
            />
            {errors.number_of_tablets && (
              <ThemedText style={styles.errorText}>{errors.number_of_tablets}</ThemedText>
            )}
            <ThemedText style={styles.helperText}>
              Usually 1 tablet per dose
            </ThemedText>
          </View>
        </View>
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
              <ThemedText style={styles.submitButtonText}>Add Deworming</ThemedText>
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warningLight,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
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
  pickerContainer: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});