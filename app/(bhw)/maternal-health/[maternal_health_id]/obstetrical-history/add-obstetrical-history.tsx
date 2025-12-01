import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#EC4899',
    primaryLight: '#FDF2F8',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    error: '#EF4444',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function AddObstetricalHistoryScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [maternalName, setMaternalName] = useState('');

  // Form state
  const [gravida, setGravida] = useState('');
  const [para, setPara] = useState('');
  const [abortion, setAbortion] = useState('');
  const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState<Date | null>(null);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | null>(null);
  const [showLMPPicker, setShowLMPPicker] = useState(false);
  const [showEDDPicker, setShowEDDPicker] = useState(false);

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/obstetrical-history` as any);
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

  const handleLMPChange = (event: any, selectedDate?: Date) => {
    setShowLMPPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setLastMenstrualPeriod(selectedDate);
      setErrors({ ...errors, lastMenstrualPeriod: '' });
      
      // Auto-calculate EDD (LMP + 280 days)
      const edd = new Date(selectedDate);
      edd.setDate(edd.getDate() + 280);
      setExpectedDeliveryDate(edd);
    }
  };

  const handleEDDChange = (event: any, selectedDate?: Date) => {
    setShowEDDPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpectedDeliveryDate(selectedDate);
      setErrors({ ...errors, expectedDeliveryDate: '' });
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Gravida validation
    if (!gravida.trim()) {
      newErrors.gravida = 'Gravida is required';
    } else if (isNaN(Number(gravida)) || Number(gravida) < 0) {
      newErrors.gravida = 'Must be a valid number';
    }

    // Para validation
    if (!para.trim()) {
      newErrors.para = 'Para is required';
    } else if (isNaN(Number(para)) || Number(para) < 0) {
      newErrors.para = 'Must be a valid number';
    }

    // Abortion validation (optional but must be valid if provided)
    if (abortion.trim() && (isNaN(Number(abortion)) || Number(abortion) < 0)) {
      newErrors.abortion = 'Must be a valid number';
    }

    // LMP validation
    if (!lastMenstrualPeriod) {
      newErrors.lastMenstrualPeriod = 'Last Menstrual Period is required';
    } else if (lastMenstrualPeriod > new Date()) {
      newErrors.lastMenstrualPeriod = 'Cannot be in the future';
    }

    // EDD validation
    if (!expectedDeliveryDate) {
      newErrors.expectedDeliveryDate = 'Expected Delivery Date is required';
    } else if (lastMenstrualPeriod && expectedDeliveryDate < lastMenstrualPeriod) {
      newErrors.expectedDeliveryDate = 'Must be after LMP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all fields');
      return;
    }

    Alert.alert(
      'Confirm',
      'Add obstetrical history record?',
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
        gravida: parseInt(gravida),
        para: parseInt(para),
        abortion: abortion.trim() ? parseInt(abortion) : null,
        last_menstrual_period: lastMenstrualPeriod?.toISOString().split('T')[0],
        expected_date_of_delivery: expectedDeliveryDate?.toISOString().split('T')[0],
        personnel_id: personnelId,
      };

      console.log('📤 Submitting obstetrical history:', payload);

      const response = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/obstetrical-history/create/`,
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

      if (data.success) {
        Alert.alert(
          'Success',
          'Obstetrical history added successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push(
                  `/(bhw)/maternal-health/${maternal_health_id}/obstetrical-history` as any
                );
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to add obstetrical history');
      }
    } catch (error) {
      console.error('❌ Error adding obstetrical history:', error);
      Alert.alert('Error', 'Failed to add obstetrical history. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Obstetrical History" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Obstetrical History" onBackPress={handleBackPress} />

      {/* Maternal Name Banner */}
      {maternalName && (
        <View style={styles.bannerCard}>
          <Ionicons name="woman" size={24} color={theme.colors.primary} />
          <View style={styles.bannerInfo}>
            <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Add Pregnancy History</ThemedText>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* GPA Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Pregnancy History (GPA)</ThemedText>
          </View>

          {/* Gravida */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Gravida (Number of Pregnancies) *
            </ThemedText>
            <TextInput
              style={[styles.input, errors.gravida && styles.inputError]}
              value={gravida}
              onChangeText={(text) => {
                setGravida(text);
                setErrors({ ...errors, gravida: '' });
              }}
              placeholder="Enter number"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textMuted}
            />
            {errors.gravida && (
              <ThemedText style={styles.errorText}>{errors.gravida}</ThemedText>
            )}
          </View>

          {/* Para */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Para (Number of Births) *
            </ThemedText>
            <TextInput
              style={[styles.input, errors.para && styles.inputError]}
              value={para}
              onChangeText={(text) => {
                setPara(text);
                setErrors({ ...errors, para: '' });
              }}
              placeholder="Enter number"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textMuted}
            />
            {errors.para && (
              <ThemedText style={styles.errorText}>{errors.para}</ThemedText>
            )}
          </View>

          {/* Abortion */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Abortion (Miscarriages/Abortions)
            </ThemedText>
            <TextInput
              style={[styles.input, errors.abortion && styles.inputError]}
              value={abortion}
              onChangeText={(text) => {
                setAbortion(text);
                setErrors({ ...errors, abortion: '' });
              }}
              placeholder="Enter number (optional)"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textMuted}
            />
            {errors.abortion && (
              <ThemedText style={styles.errorText}>{errors.abortion}</ThemedText>
            )}
          </View>
        </View>

        {/* Date Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Date Information</ThemedText>
          </View>

          {/* Last Menstrual Period */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Last Menstrual Period (LMP) *
            </ThemedText>
            <TouchableOpacity
              style={[styles.dateButton, errors.lastMenstrualPeriod && styles.inputError]}
              onPress={() => setShowLMPPicker(true)}
            >
              <ThemedText style={[
                styles.dateButtonText,
                !lastMenstrualPeriod && styles.placeholderText
              ]}>
                {formatDate(lastMenstrualPeriod)}
              </ThemedText>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {errors.lastMenstrualPeriod && (
              <ThemedText style={styles.errorText}>{errors.lastMenstrualPeriod}</ThemedText>
            )}
          </View>

          {showLMPPicker && (
            <DateTimePicker
              value={lastMenstrualPeriod || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleLMPChange}
              maximumDate={new Date()}
            />
          )}

          {/* Expected Delivery Date */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Expected Date of Delivery (EDD) *
            </ThemedText>
            <TouchableOpacity
              style={[styles.dateButton, errors.expectedDeliveryDate && styles.inputError]}
              onPress={() => setShowEDDPicker(true)}
            >
              <ThemedText style={[
                styles.dateButtonText,
                !expectedDeliveryDate && styles.placeholderText
              ]}>
                {formatDate(expectedDeliveryDate)}
              </ThemedText>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {errors.expectedDeliveryDate && (
              <ThemedText style={styles.errorText}>{errors.expectedDeliveryDate}</ThemedText>
            )}
            {lastMenstrualPeriod && expectedDeliveryDate && (
              <ThemedText style={styles.helperText}>
                Auto-calculated: 280 days from LMP
              </ThemedText>
            )}
          </View>

          {showEDDPicker && (
            <DateTimePicker
              value={expectedDeliveryDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEDDChange}
              minimumDate={lastMenstrualPeriod || undefined}
            />
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Adding...</ThemedText>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Add Obstetrical History</ThemedText>
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
  placeholderText: {
    color: theme.colors.textMuted,
    fontWeight: '400',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.disabled,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});