import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#EC4899',
    primaryLight: '#FDF2F8',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface LookupData {
  outcome_types: Array<{ outcome_type_id: number; outcome_type_description: string }>;
  delivery_types: Array<{ delivery_type_id: number; delivery_name: string }>;
  place_delivery_types: Array<{ place_delivery_type_id: number; place_delivery_name: string }>;
  ownership_types: Array<{ ownership_type_id: number; ownership_name: string }>;
  birth_attendants: Array<{ birth_attendant_id: number; birth_attendant_name: string }>;
}

export default function AddPregnancyOutcomeScreen() {
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [maternalName, setMaternalName] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [outcomeTypeId, setOutcomeTypeId] = useState<number | null>(null);
  const [deliveryTypeId, setDeliveryTypeId] = useState<number | null>(null);
  const [placeDeliveryTypeId, setPlaceDeliveryTypeId] = useState<number | null>(null);
  const [ownershipTypeId, setOwnershipTypeId] = useState<number | null>(null);
  const [othersDescription, setOthersDescription] = useState('');
  const [birthAttendantId, setBirthAttendantId] = useState<number | null>(null);
  const [otherAttendant, setOtherAttendant] = useState('');
  const [dateTerminated, setDateTerminated] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeOfDelivery, setTimeOfDelivery] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ✅ NEW: Baby information fields
  const [babyBirthweight, setBabyBirthweight] = useState('');
  const [babySex, setBabySex] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const handleBackPress = () => {
    router.push(`/(bhw)/maternal-health/${maternal_health_id}/pregnancy-outcome` as any);
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
      setHasError(false);
      setErrorMessage('');

      const session = await getUserSession();
      if (!session) {
        Alert.alert('Session Expired', 'Please log in again', [
          {
            text: 'OK',
            onPress: () => router.push('/(auth)/login'),
          },
        ]);
        return;
      }

      console.log('✅ Session loaded:', session);

      // Fetch maternal info
      const maternalResponse = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const maternalData = await maternalResponse.json();
      
      if (maternalData.success) {
        setMaternalName(maternalData.data.full_name || '');
      }

      // Fetch lookup data
      const [outcomeRes, deliveryRes, placeRes, ownershipRes, attendantRes] = await Promise.all([
        fetch(`${API_BASE_URL}/household_api/outcome-types/`),
        fetch(`${API_BASE_URL}/household_api/delivery-types/`),
        fetch(`${API_BASE_URL}/household_api/place-delivery-types/`),
        fetch(`${API_BASE_URL}/household_api/ownership-types/`),
        fetch(`${API_BASE_URL}/household_api/birth-attendants/`),
      ]);

      const [outcomeData, deliveryData, placeData, ownershipData, attendantData] = await Promise.all([
        outcomeRes.json(),
        deliveryRes.json(),
        placeRes.json(),
        ownershipRes.json(),
        attendantRes.json(),
      ]);

      const extractData = (data: any) => {
        if (data && data.results && Array.isArray(data.results)) {
          return data.results;
        }
        if (Array.isArray(data)) {
          return data;
        }
        if (data && data.data && Array.isArray(data.data)) {
          return data.data;
        }
        return [];
      };

      const outcome_types = extractData(outcomeData);
      const delivery_types = extractData(deliveryData);
      const place_delivery_types = extractData(placeData);
      const ownership_types = extractData(ownershipData);
      const birth_attendants = extractData(attendantData);

      console.log('✅ Extracted Data Counts:', {
        outcome_types: outcome_types.length,
        delivery_types: delivery_types.length,
        place_delivery_types: place_delivery_types.length,
        ownership_types: ownership_types.length,
        birth_attendants: birth_attendants.length,
      });

      const allEmpty = (
        outcome_types.length === 0 &&
        delivery_types.length === 0 &&
        place_delivery_types.length === 0 &&
        ownership_types.length === 0 &&
        birth_attendants.length === 0
      );

      if (allEmpty) {
        setHasError(true);
        setErrorMessage('No lookup data available. Please contact your administrator to set up the required data.');
      } else {
        setLookupData({
          outcome_types,
          delivery_types,
          place_delivery_types,
          ownership_types,
          birth_attendants,
        });
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
      setHasError(true);
      setErrorMessage('Failed to load form data. Please check your connection and try again.');
      Alert.alert('Error', 'Failed to load form data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setOutcomeTypeId(null);
    setDeliveryTypeId(null);
    setPlaceDeliveryTypeId(null);
    setOwnershipTypeId(null);
    setOthersDescription('');
    setBirthAttendantId(null);
    setOtherAttendant('');
    setDateTerminated(new Date());
    setTimeOfDelivery(new Date());
    setBabyBirthweight('');
    setBabySex(null);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateTerminated(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTimeOfDelivery(selectedTime);
    }
  };

  const validateForm = (): boolean => {
    if (!outcomeTypeId) {
      Alert.alert('Validation Error', 'Please select outcome type');
      return false;
    }
    if (!deliveryTypeId) {
      Alert.alert('Validation Error', 'Please select delivery type');
      return false;
    }
    if (!placeDeliveryTypeId) {
      Alert.alert('Validation Error', 'Please select place of delivery');
      return false;
    }
    if (!birthAttendantId) {
      Alert.alert('Validation Error', 'Please select birth attendant');
      return false;
    }

    const selectedPlace = lookupData?.place_delivery_types.find(
      (p) => p.place_delivery_type_id === placeDeliveryTypeId
    );
    
    if (selectedPlace?.place_delivery_name.toUpperCase() === 'HEALTH FACILITY') {
      if (!ownershipTypeId) {
        Alert.alert('Validation Error', 'Ownership type is required for Health Facility');
        return false;
      }
    }

    if (selectedPlace?.place_delivery_name.toUpperCase() === 'OTHERS') {
      if (!othersDescription.trim()) {
        Alert.alert('Validation Error', 'Please describe other place of delivery');
        return false;
      }
    }

    const selectedAttendant = lookupData?.birth_attendants.find(
      (a) => a.birth_attendant_id === birthAttendantId
    );
    
    if (selectedAttendant?.birth_attendant_name.toUpperCase() === 'OTHERS') {
      if (!otherAttendant.trim()) {
        Alert.alert('Validation Error', 'Please specify other birth attendant');
        return false;
      }
    }

    // ✅ NEW: Validate baby birthweight if provided
    if (babyBirthweight.trim()) {
      const weight = Number(babyBirthweight);
      if (isNaN(weight)) {
        Alert.alert('Invalid Input', 'Baby birthweight must be a number');
        return false;
      }
      if (weight < 0) {
        Alert.alert('Invalid Input', 'Baby birthweight cannot be negative');
        return false;
      }
      if (weight > 10000) {
        Alert.alert('Invalid Input', 'Baby birthweight seems unusually high (over 10kg). Please verify.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const session = await getUserSession();
      
      console.log('🔍 Current session:', session);

      if (!session) {
        Alert.alert('Session Expired', 'Please log in again', [
          {
            text: 'OK',
            onPress: () => router.push('/(auth)/login'),
          },
        ]);
        return;
      }

      const personnelId = session.user_id;

      if (!personnelId) {
        console.error('❌ No user_id in session:', session);
        Alert.alert('Error', 'Invalid session. Please log in again.', [
          {
            text: 'OK',
            onPress: () => router.push('/(auth)/login'),
          },
        ]);
        return;
      }

      const formattedTime = timeOfDelivery.toTimeString().split(' ')[0];
      const formattedDate = dateTerminated.toISOString().split('T')[0];

      const selectedPlace = lookupData?.place_delivery_types.find(
        (p) => p.place_delivery_type_id === placeDeliveryTypeId
      );
      
      const isHealthFacility = selectedPlace?.place_delivery_name.toUpperCase() === 'HEALTH FACILITY';
      const isOtherPlace = selectedPlace?.place_delivery_name.toUpperCase() === 'OTHERS';

      const selectedAttendant = lookupData?.birth_attendants.find(
        (a) => a.birth_attendant_id === birthAttendantId
      );
      const isOtherAttendant = selectedAttendant?.birth_attendant_name.toUpperCase() === 'OTHERS';

      const payload = {
        outcome_type_id: outcomeTypeId,
        delivery_type_id: deliveryTypeId,
        place_delivery_type_id: placeDeliveryTypeId,
        ownership_type_id: isHealthFacility ? ownershipTypeId : null,
        others_description: isOtherPlace ? othersDescription.trim() : null,
        birth_attendant_id: birthAttendantId,
        other_attendant: isOtherAttendant ? otherAttendant.trim() : null,
        time_of_delivery: formattedTime,
        date_terminated: formattedDate,
        baby_birthweight_in_grams: babyBirthweight.trim() ? parseInt(babyBirthweight) : null,
        baby_sex: babySex || null,
        personnel_id: personnelId,
      };

      console.log('📤 Submitting payload:', payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_DELIVERY_OUTCOME_ADD(parseInt(maternal_health_id))}`,
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
        clearForm();
        
        Alert.alert('Success', 'Pregnancy outcome recorded successfully', [
          {
            text: 'OK',
            onPress: () => {
              router.replace(`/(bhw)/maternal-health/${maternal_health_id}/pregnancy-outcome`);
            },
          },
        ]);
      } else {
        Alert.alert('Error', data.error || data.message || 'Failed to record pregnancy outcome');
      }
    } catch (error) {
      console.error('❌ Error submitting:', error);
      Alert.alert('Error', 'Failed to record pregnancy outcome. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Pregnancy Outcome" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading form...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Pregnancy Outcome" onBackPress={handleBackPress} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <ThemedText style={styles.errorTitle}>Unable to Load Form</ThemedText>
          <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Pregnancy Outcome" onBackPress={handleBackPress} />

      {maternalName && (
        <View style={styles.bannerCard}>
          <MaterialCommunityIcons name="baby-carriage" size={24} color={theme.colors.primary} />
          <ThemedText style={styles.bannerText}>{maternalName}</ThemedText>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Outcome Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.sectionTitle}>Outcome Information</ThemedText>
          </View>

          {/* Outcome Type */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>
              Outcome Type <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            {lookupData?.outcome_types && lookupData.outcome_types.length > 0 ? (
              <View style={styles.optionsGrid}>
                {lookupData.outcome_types.map((item) => (
                  <TouchableOpacity
                    key={item.outcome_type_id}
                    style={[
                      styles.optionCard,
                      outcomeTypeId === item.outcome_type_id && styles.optionCardSelected,
                    ]}
                    onPress={() => setOutcomeTypeId(item.outcome_type_id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.radioCircle,
                          outcomeTypeId === item.outcome_type_id && styles.radioCircleSelected,
                        ]}
                      >
                        {outcomeTypeId === item.outcome_type_id && (
                          <View style={styles.radioCircleInner} />
                        )}
                      </View>
                      <ThemedText
                        style={[
                          styles.optionText,
                          outcomeTypeId === item.outcome_type_id && styles.optionTextSelected,
                        ]}
                      >
                        {item.outcome_type_description}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
                <ThemedText style={styles.emptyText}>No outcome types available</ThemedText>
              </View>
            )}
          </View>

          {/* Delivery Type */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>
              Type of Delivery <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            {lookupData?.delivery_types && lookupData.delivery_types.length > 0 ? (
              <View style={styles.optionsGrid}>
                {lookupData.delivery_types.map((item) => (
                  <TouchableOpacity
                    key={item.delivery_type_id}
                    style={[
                      styles.optionCard,
                      deliveryTypeId === item.delivery_type_id && styles.optionCardSelected,
                    ]}
                    onPress={() => setDeliveryTypeId(item.delivery_type_id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.radioCircle,
                          deliveryTypeId === item.delivery_type_id && styles.radioCircleSelected,
                        ]}
                      >
                        {deliveryTypeId === item.delivery_type_id && (
                          <View style={styles.radioCircleInner} />
                        )}
                      </View>
                      <ThemedText
                        style={[
                          styles.optionText,
                          deliveryTypeId === item.delivery_type_id && styles.optionTextSelected,
                        ]}
                      >
                        {item.delivery_name}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
                <ThemedText style={styles.emptyText}>No delivery types available</ThemedText>
              </View>
            )}
          </View>

          {/* Date Terminated */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>
              Date Terminated <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.dateText}>
                {dateTerminated.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateTerminated}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Time of Delivery */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Time of Delivery</ThemedText>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.dateText}>
                {timeOfDelivery.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={timeOfDelivery}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
        </View>

        {/* ✅ NEW: Baby Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.sectionTitle}>Baby Information</ThemedText>
          </View>

          {/* Baby Birthweight */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Baby Birthweight (grams)</ThemedText>
            <TextInput
              style={styles.textInput}
              value={babyBirthweight}
              onChangeText={setBabyBirthweight}
              placeholder="e.g., 3200"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          {/* Baby Sex */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Baby&apos;s Sex</ThemedText>
            <View style={styles.optionsGrid}>
              {['Male', 'Female'].map((sex) => (
                <TouchableOpacity
                  key={sex}
                  style={[
                    styles.optionCard,
                    babySex === sex && styles.optionCardSelected,
                  ]}
                  onPress={() => setBabySex(sex)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.radioCircle,
                        babySex === sex && styles.radioCircleSelected,
                      ]}
                    >
                      {babySex === sex && (
                        <View style={styles.radioCircleInner} />
                      )}
                    </View>
                    <ThemedText
                      style={[
                        styles.optionText,
                        babySex === sex && styles.optionTextSelected,
                      ]}
                    >
                      {sex}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Place of Delivery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.sectionTitle}>Place of Delivery</ThemedText>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>
              Place of Delivery <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            {lookupData?.place_delivery_types && lookupData.place_delivery_types.length > 0 ? (
              <View style={styles.optionsGrid}>
                {lookupData.place_delivery_types.map((item) => (
                  <TouchableOpacity
                    key={item.place_delivery_type_id}
                    style={[
                      styles.optionCard,
                      placeDeliveryTypeId === item.place_delivery_type_id && styles.optionCardSelected,
                    ]}
                    onPress={() => setPlaceDeliveryTypeId(item.place_delivery_type_id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.radioCircle,
                          placeDeliveryTypeId === item.place_delivery_type_id && styles.radioCircleSelected,
                        ]}
                      >
                        {placeDeliveryTypeId === item.place_delivery_type_id && (
                          <View style={styles.radioCircleInner} />
                        )}
                      </View>
                      <ThemedText
                        style={[
                          styles.optionText,
                          placeDeliveryTypeId === item.place_delivery_type_id && styles.optionTextSelected,
                        ]}
                      >
                        {item.place_delivery_name}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
                <ThemedText style={styles.emptyText}>No delivery places available</ThemedText>
              </View>
            )}
          </View>

          {/* Facility Ownership (conditional) */}
          {lookupData?.place_delivery_types.find((p) => p.place_delivery_type_id === placeDeliveryTypeId)
            ?.place_delivery_name.toUpperCase() === 'HEALTH FACILITY' && (
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>
                Facility Ownership <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              {lookupData?.ownership_types && lookupData.ownership_types.length > 0 ? (
                <View style={styles.optionsGrid}>
                  {lookupData.ownership_types.map((item) => (
                    <TouchableOpacity
                      key={item.ownership_type_id}
                      style={[
                        styles.optionCard,
                        ownershipTypeId === item.ownership_type_id && styles.optionCardSelected,
                      ]}
                      onPress={() => setOwnershipTypeId(item.ownership_type_id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionContent}>
                        <View
                          style={[
                            styles.radioCircle,
                            ownershipTypeId === item.ownership_type_id && styles.radioCircleSelected,
                          ]}
                        >
                          {ownershipTypeId === item.ownership_type_id && (
                            <View style={styles.radioCircleInner} />
                          )}
                        </View>
                        <ThemedText
                          style={[
                            styles.optionText,
                            ownershipTypeId === item.ownership_type_id && styles.optionTextSelected,
                          ]}
                        >
                          {item.ownership_name}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
                  <ThemedText style={styles.emptyText}>No ownership types available</ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Others Description (conditional) */}
          {lookupData?.place_delivery_types.find((p) => p.place_delivery_type_id === placeDeliveryTypeId)
            ?.place_delivery_name.toUpperCase() === 'OTHERS' && (
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>
                Specify Other Place <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={othersDescription}
                onChangeText={setOthersDescription}
                placeholder="Enter place description..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </View>

        {/* Birth Attendant Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.sectionTitle}>Birth Attendant</ThemedText>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>
              Birth Attendant <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            {lookupData?.birth_attendants && lookupData.birth_attendants.length > 0 ? (
              <View style={styles.optionsGrid}>
                {lookupData.birth_attendants.map((item) => (
                  <TouchableOpacity
                    key={item.birth_attendant_id}
                    style={[
                      styles.optionCard,
                      birthAttendantId === item.birth_attendant_id && styles.optionCardSelected,
                    ]}
                    onPress={() => setBirthAttendantId(item.birth_attendant_id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.radioCircle,
                          birthAttendantId === item.birth_attendant_id && styles.radioCircleSelected,
                        ]}
                      >
                        {birthAttendantId === item.birth_attendant_id && (
                          <View style={styles.radioCircleInner} />
                        )}
                      </View>
                      <ThemedText
                        style={[
                          styles.optionText,
                          birthAttendantId === item.birth_attendant_id && styles.optionTextSelected,
                        ]}
                      >
                        {item.birth_attendant_name}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
                <ThemedText style={styles.emptyText}>No birth attendants available</ThemedText>
              </View>
            )}
          </View>

          {/* Other Attendant (conditional) */}
          {lookupData?.birth_attendants.find((a) => a.birth_attendant_id === birthAttendantId)
            ?.birth_attendant_name.toUpperCase() === 'OTHERS' && (
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>
                Specify Other Attendant <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={otherAttendant}
                onChangeText={setOtherAttendant}
                placeholder="Enter attendant name..."
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Save Pregnancy Outcome</ThemedText>
            </>
          )}
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  bannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  fieldGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  optionsGrid: {
    gap: theme.spacing.sm,
  },
  optionCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  optionCardSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: '#FEF3C7',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  textInput: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    fontSize: 14,
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});